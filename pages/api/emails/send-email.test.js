import { createMocks } from "node-mocks-http";
import handler from "./send-email";
import mailchimp from "@mailchimp/mailchimp_transactional";

jest.mock("@mailchimp/mailchimp_transactional", () => jest.fn());

describe("/api/emails/send-email", () => {
  const sendMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MAILCHIMP_TRANSACTIONAL_API_KEY = "test-key";
    sendMock.mockResolvedValue([{ status: "sent" }]);
    mailchimp.mockReturnValue({
      messages: {
        send: sendMock,
      },
    });
  });

  test("returns 400 when recipient email is missing", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        toEmail: "",
        fromEmail: "sales@statsurgicalsupply.com",
        subject: "Test",
        htmlContent: "<div>Body</div>",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe(
      "Invalid or missing recipient email",
    );
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("returns 400 when subject/content is empty", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        toEmail: "customer@example.com",
        fromEmail: "sales@statsurgicalsupply.com",
        subject: "   ",
        htmlContent: "",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("returns 400 when html has no meaningful text", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        toEmail: "customer@example.com",
        fromEmail: "sales@statsurgicalsupply.com",
        subject: "Contact",
        htmlContent: "<div>   </div><p>&nbsp;</p>",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe(
      "Email content is empty or not meaningful",
    );
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("does not add empty fromEmail as bcc", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        toEmail: "customer@example.com",
        fromEmail: "   ",
        subject: "Hello",
        htmlContent: "<div>Hello customer, your request was received.</div>",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);

    const mailchimpPayload = sendMock.mock.calls[0][0];
    expect(mailchimpPayload.message.to).toEqual([
      { email: "customer@example.com", type: "to" },
      { email: "gaby@statsurgicalsupply.com", type: "bcc" },
      { email: "sofi@statsurgicalsupply.com", type: "bcc" },
    ]);
  });

  test("accepts valid payload and sends email", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        toEmail: " customer@example.com ",
        fromEmail: "sales@statsurgicalsupply.com",
        subject: " Contact request ",
        htmlContent:
          " <div>Hello customer, this is a complete confirmation message.</div> ",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});
