import crypto from "crypto";
import NewsletterSubscriber from "../../../models/NewsletterSubscriber";
import db from "../../../utils/db";

const normalizeText = (value) =>
  (value || "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");

const createMailchimpAuthHeader = (apiKey) =>
  `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`;

const createMailchimpMemberHash = (email) =>
  crypto.createHash("md5").update(email.toLowerCase()).digest("hex");

const syncSubscriberToMailchimp = async ({ email, name }) => {
  const apiKey = normalizeText(process.env.MAILCHIMP_API_KEY);
  const serverPrefix = normalizeText(process.env.MAILCHIMP_SERVER_PREFIX);
  const audienceId = normalizeText(process.env.MAILCHIMP_AUDIENCE_ID);

  if (!apiKey || !serverPrefix || !audienceId) {
    throw new Error(
      "Mailchimp audience configuration is missing. Set MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, and MAILCHIMP_AUDIENCE_ID.",
    );
  }

  const memberHash = createMailchimpMemberHash(email);
  const response = await fetch(
    `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${memberHash}`,
    {
      method: "PUT",
      headers: {
        Authorization: createMailchimpAuthHeader(apiKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
        status: "subscribed",
        merge_fields: {
          FNAME: name || "",
        },
      }),
    },
  );

  const responseText = await response.text();
  let payload = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch (error) {
      payload = { raw: responseText };
    }
  }

  if (!response.ok) {
    const message =
      payload?.detail ||
      payload?.title ||
      payload?.raw ||
      "Unable to sync subscriber to Mailchimp";
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload || {};
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const name = normalizeText(req.body?.name);
  const email = normalizeText(req.body?.email).toLowerCase();
  const source = normalizeText(req.body?.source) || "footer";
  const page = normalizeText(req.body?.page);
  const referrer = normalizeText(req.body?.referrer);

  if (!email || !isValidEmail(email)) {
    return res
      .status(400)
      .json({ message: "A valid email address is required" });
  }

  try {
    await db.connect(true);

    const now = new Date();
    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          source,
          status: "subscribed",
          lastSyncedAt: now,
          metadata: {
            page,
            referrer,
          },
        },
        $setOnInsert: {
          email,
          subscribedAt: now,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    const mailchimpResult = await syncSubscriberToMailchimp({ email, name });

    subscriber.mailchimpMemberId =
      mailchimpResult?.id || subscriber.mailchimpMemberId;
    subscriber.lastSyncedAt = new Date();
    await subscriber.save();

    return res.status(200).json({
      message:
        "Subscriber saved in the database and synchronized with Mailchimp",
      subscriber: {
        _id: subscriber._id,
        name: subscriber.name,
        email: subscriber.email,
        source: subscriber.source,
        status: subscriber.status,
        subscribedAt: subscriber.subscribedAt,
      },
      mailchimp: {
        id: mailchimpResult?.id || null,
        status: mailchimpResult?.status || "subscribed",
      },
    });
  } catch (error) {
    console.error("newsletter subscribe error:", error);
    return res.status(500).json({
      message: error?.message || "Unable to subscribe this email right now",
    });
  }
}
