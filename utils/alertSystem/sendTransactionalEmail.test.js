import { beforeEach, describe, expect, test, vi } from "vitest";
import mailchimp from "@mailchimp/mailchimp_transactional";
import { sendTransactionalEmail } from "./sendTransactionalEmail";

vi.mock("@mailchimp/mailchimp_transactional", () => ({ default: vi.fn() }));

const sendMock = vi.fn();
const recipients = () =>
  sendMock.mock.calls[0][0].message.to.map(({ email, type }) => [type, email]);

describe("sendTransactionalEmail recipients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendMock.mockResolvedValue([{ status: "sent" }]);
    mailchimp.mockReturnValue({ messages: { send: sendMock } });
  });

  test("copies staff and the sender by default", async () => {
    await sendTransactionalEmail({
      toEmail: "ana@clinic.com",
      fromEmail: "rep@statsurgicalsupply.com",
      subject: "Hi",
      html: "<p>Hi</p>",
    });

    expect(recipients()).toEqual([
      ["to", "ana@clinic.com"],
      ["bcc", "gaby@statsurgicalsupply.com"],
      ["bcc", "sofi@statsurgicalsupply.com"],
      ["bcc", "rep@statsurgicalsupply.com"],
    ]);
  });

  test("copyStaff: false sends to the recipient only", async () => {
    await sendTransactionalEmail({
      toEmail: "ana@clinic.com",
      fromEmail: "sofi@statsurgicalsupply.com",
      subject: "Reset",
      html: "<p>link</p>",
      copyStaff: false,
    });

    expect(recipients()).toEqual([["to", "ana@clinic.com"]]);
  });

  test("never sends the same address twice", async () => {
    await sendTransactionalEmail({
      toEmail: "sales@statsurgicalsupply.com",
      fromEmail: "sales@statsurgicalsupply.com",
      subject: "Notice",
      html: "<p>Notice</p>",
      bcc: ["sofi@statsurgicalsupply.com", "SALES@statsurgicalsupply.com"],
    });

    expect(recipients()).toEqual([
      ["to", "sales@statsurgicalsupply.com"],
      ["bcc", "gaby@statsurgicalsupply.com"],
      ["bcc", "sofi@statsurgicalsupply.com"],
    ]);
  });
});
