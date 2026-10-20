import { beforeEach, describe, expect, test, vi } from "vitest";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/auth/requestResetCode";
import WpUser from "../../../models/WpUser";
import RateLimit from "../../../models/RateLimit";
import { sendTransactionalEmail } from "../../../utils/alertSystem/sendTransactionalEmail";

vi.mock("../../../utils/db", () => ({
  default: { connect: vi.fn(), disconnect: vi.fn() },
}));
vi.mock("../../../models/WpUser", () => ({ default: { findOne: vi.fn() } }));
// In-memory attempt counters (see utils/rateLimit.js).
vi.mock("../../../models/RateLimit", () => {
  const counters = new Map();
  return {
    default: {
      counters,
      findOneAndUpdate: vi.fn(({ key }) => ({
        lean: async () => {
          counters.set(key, (counters.get(key) || 0) + 1);
          return { key, count: counters.get(key) };
        },
      })),
    },
  };
});
vi.mock(
  "../../../utils/alertSystem/sendTransactionalEmail",
  async (importOriginal) => ({
    ...(await importOriginal()),
    sendTransactionalEmail: vi.fn(),
  }),
);

const GENERIC_MESSAGE =
  "If we find your email, a reset code has been sent to it.";

const postEmail = async (email, ip = "203.0.113.7") => {
  const { req, res } = createMocks({
    method: "POST",
    body: { email },
    headers: { "x-real-ip": ip },
  });
  await handler(req, res);
  return res;
};

describe("/api/auth/requestResetCode", () => {
  let user;

  beforeEach(() => {
    vi.clearAllMocks();
    RateLimit.counters.clear();
    user = {
      firstName: "Ana",
      lastName: "Diaz",
      email: "ana+orders@example.com",
      save: vi.fn(),
    };
    sendTransactionalEmail.mockResolvedValue([{ status: "sent" }]);
  });

  test("emails the code and never returns it", async () => {
    WpUser.findOne.mockResolvedValue(user);

    const res = await postEmail(" ana+orders@example.com ");

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body).toEqual({ message: GENERIC_MESSAGE });

    const { code } = user.resetCode;
    expect(code).toMatch(/^[A-Za-z0-9]{10}$/);
    expect(res._getData()).not.toContain(code);
    expect(user.save).toHaveBeenCalledTimes(1);

    expect(sendTransactionalEmail).toHaveBeenCalledTimes(1);
    const sent = sendTransactionalEmail.mock.calls[0][0];
    expect(sent.toEmail).toBe("ana+orders@example.com");
    // A working reset link must not be copied to staff inboxes.
    expect(sent.copyStaff).toBe(false);
    expect(sent.html).toContain(code);
    expect(sent.html).toContain(
      `authenticateCode?email=ana%2Borders%40example.com&code=${code}`,
    );
  });

  test("gives the same reply for unknown emails without sending", async () => {
    WpUser.findOne.mockResolvedValue(null);

    const res = await postEmail("nobody@example.com");

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ message: GENERIC_MESSAGE });
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
  });

  test("rejects a missing or non-string email", async () => {
    expect((await postEmail("")).statusCode).toBe(400);
    expect((await postEmail({ $ne: null })).statusCode).toBe(400);
    expect(WpUser.findOne).not.toHaveBeenCalled();
  });

  test("limits requests for one address, even from different IPs", async () => {
    WpUser.findOne.mockResolvedValue(null);
    for (let i = 0; i < 5; i++) {
      expect((await postEmail("ana@clinic.com", `198.51.100.${i}`)).statusCode).toBe(
        200,
      );
    }

    expect((await postEmail("ana@clinic.com", "198.51.100.99")).statusCode).toBe(
      429,
    );
    expect((await postEmail("bob@clinic.com", "198.51.100.99")).statusCode).toBe(
      200,
    );
  });

  test("limits requests from one IP across addresses", async () => {
    WpUser.findOne.mockResolvedValue(null);
    for (let i = 0; i < 10; i++) {
      expect((await postEmail(`user${i}@clinic.com`)).statusCode).toBe(200);
    }

    const res = await postEmail("one-more@clinic.com");
    expect(res.statusCode).toBe(429);
    expect(JSON.parse(res._getData()).message).toMatch(/^Too many attempts/);
  });

  test("reports a failure when the email provider rejects it", async () => {
    WpUser.findOne.mockResolvedValue(user);
    sendTransactionalEmail.mockResolvedValue([
      { status: "rejected", reject_reason: "invalid-sender" },
    ]);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await postEmail("ana+orders@example.com");

    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).not.toContain(user.resetCode.code);
    consoleError.mockRestore();
  });
});
