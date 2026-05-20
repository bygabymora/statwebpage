import { createMocks } from "node-mocks-http";
import handler from "./subscribe";
import NewsletterSubscriber from "../../../models/NewsletterSubscriber";
import db from "../../../utils/db";

jest.mock("../../../utils/db", () => ({
  connect: jest.fn(),
}));

jest.mock("../../../models/NewsletterSubscriber", () => ({
  __esModule: true,
  default: {
    findOneAndUpdate: jest.fn(),
  },
}));

describe("/api/newsletter/subscribe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MAILCHIMP_API_KEY = "test-mailchimp-key";
    process.env.MAILCHIMP_SERVER_PREFIX = "us1";
    process.env.MAILCHIMP_AUDIENCE_ID = "audience-id";
    global.fetch = jest.fn();
  });

  test("returns 400 for invalid email", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { name: "Test", email: "invalid-email" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(db.connect).not.toHaveBeenCalled();
    expect(NewsletterSubscriber.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("saves the subscriber and syncs with Mailchimp", async () => {
    const saveMock = jest.fn().mockResolvedValue(true);
    NewsletterSubscriber.findOneAndUpdate.mockResolvedValue({
      _id: "subscriber-id",
      name: "Jane Doe",
      email: "jane@example.com",
      source: "footer",
      status: "subscribed",
      subscribedAt: new Date("2026-01-01T00:00:00.000Z"),
      mailchimpMemberId: null,
      lastSyncedAt: null,
      save: saveMock,
    });

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: jest
        .fn()
        .mockResolvedValue(
          JSON.stringify({ id: "mailchimp-member-id", status: "subscribed" }),
        ),
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "Jane Doe",
        email: " jane@example.com ",
        source: "footer",
        page: "/",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(db.connect).toHaveBeenCalledWith(true);
    expect(NewsletterSubscriber.findOneAndUpdate).toHaveBeenCalledWith(
      { email: "jane@example.com" },
      expect.objectContaining({
        $set: expect.objectContaining({
          name: "Jane Doe",
          source: "footer",
          status: "subscribed",
        }),
      }),
      expect.objectContaining({ upsert: true, new: true }),
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledTimes(1);
  });
});
