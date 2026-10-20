import { beforeEach, describe, expect, test, vi } from "vitest";
import bcryptjs from "bcryptjs";
import { createMocks } from "node-mocks-http";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import resetPasswordHandler from "../../../pages/api/auth/resetPassword";
import WpUser from "../../../models/WpUser";
import RateLimit from "../../../models/RateLimit";

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
      findOne: vi.fn(({ key }) => ({
        lean: async () =>
          counters.has(key) ? { key, count: counters.get(key) } : null,
      })),
      deleteOne: vi.fn(async ({ key }) => {
        counters.delete(key);
      }),
    },
  };
});

const authorize = authOptions.providers.find((p) => p.id === "credentials")
  .options.authorize;

const PASSWORD = "Correct#Horse1";
const LOCKED = /^Too many failed login attempts\. Please try again in \d+ minutes?, or reset your password\.$/;

const login = (email, password) => authorize({ email, password });
const failTimes = async (n, email = "ana@clinic.com") => {
  for (let i = 0; i < n; i++) {
    await expect(login(email, "wrong")).rejects.toThrow(
      "Invalid email or password",
    );
  }
};

let user;

beforeEach(() => {
  vi.clearAllMocks();
  RateLimit.counters.clear();
  user = {
    _id: "507f1f77bcf86cd799439011",
    email: "ana@clinic.com",
    firstName: "Ana",
    password: bcryptjs.hashSync(PASSWORD, 4),
    active: true,
    save: vi.fn(),
  };
  WpUser.findOne.mockImplementation(async ({ email }) =>
    email === user.email ? user : null,
  );
});

describe("login attempts, limited per account", () => {
  test("a correct password signs in", async () => {
    await expect(login("ana@clinic.com", PASSWORD)).resolves.toMatchObject({
      email: "ana@clinic.com",
    });
  });

  test("after 10 failures the account is locked, even for the right password", async () => {
    await failTimes(10);

    await expect(login("ana@clinic.com", PASSWORD)).rejects.toThrow(LOCKED);
    await expect(login("ANA@clinic.com ", "wrong")).rejects.toThrow(LOCKED);
  });

  test("only that account: others (same office, same IP) still sign in", async () => {
    await failTimes(10);
    const colleague = { ...user, email: "bob@clinic.com" };
    WpUser.findOne.mockImplementation(async ({ email }) =>
      email === "bob@clinic.com" ? colleague : user,
    );

    await expect(login("bob@clinic.com", PASSWORD)).resolves.toMatchObject({
      email: "bob@clinic.com",
    });
  });

  test("a successful login clears the count", async () => {
    await failTimes(9);
    await login("ana@clinic.com", PASSWORD);
    await failTimes(9);

    await expect(login("ana@clinic.com", PASSWORD)).resolves.toBeTruthy();
  });

  test("unknown emails are counted too, so the lock reveals nothing", async () => {
    await failTimes(10, "nobody@clinic.com");

    await expect(login("nobody@clinic.com", "wrong")).rejects.toThrow(LOCKED);
  });

  test("an inactive account is only reported after the right password", async () => {
    user.active = false;

    await expect(login("ana@clinic.com", "wrong")).rejects.toThrow(
      "Invalid email or password",
    );
    await expect(login("ana@clinic.com", PASSWORD)).rejects.toThrow(
      "Your account is inactive. Please contact support.",
    );
  });

  test("an account without a password (Google sign-up) is just a failed login", async () => {
    user.password = undefined;

    await expect(login("ana@clinic.com", "anything")).rejects.toThrow(
      "Invalid email or password",
    );
  });

  test("resetting the password unlocks the account right away", async () => {
    await failTimes(10);
    user.resetCode = {
      code: "AbC123xYz9",
      expireDate: new Date(Date.now() + 60_000),
    };

    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "ana@clinic.com",
        code: "AbC123xYz9",
        newPassword: "New#Password2",
      },
    });
    await resetPasswordHandler(req, res);

    expect(res.statusCode).toBe(200);
    await expect(login("ana@clinic.com", "New#Password2")).resolves.toBeTruthy();
  });
});
