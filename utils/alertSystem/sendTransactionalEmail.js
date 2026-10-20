import mailchimp from "@mailchimp/mailchimp_transactional";

// Server-only: sends email through Mailchimp Transactional.

export const normalizeText = (value) =>
  (value || "").replace(/[​-‍﻿]/g, "").trim();

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

// Every email is also copied to these inboxes, unless copyStaff is false.
const STAFF_BCC = ["gaby@statsurgicalsupply.com", "sofi@statsurgicalsupply.com"];

// Expects normalized, already-validated addresses and content.
// copyStaff: false keeps the email between the sender and the recipient only
// (no staff or sender copies) -- for emails that carry credentials, like a
// password reset link.
// Resolves to Mailchimp's per-recipient results.
export async function sendTransactionalEmail({
  toEmail,
  fromEmail,
  subject,
  html,
  headers,
  attachment,
  bcc,
  copyStaff = true,
}) {
  const client = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY);

  // Each address gets one copy: never BCC the recipient or repeat an address.
  const bccRecipients = [];
  const addBcc = (email) => {
    const normalized = normalizeText(email).toLowerCase();
    if (
      normalized &&
      isValidEmail(normalized) &&
      normalized !== toEmail &&
      !bccRecipients.includes(normalized)
    ) {
      bccRecipients.push(normalized);
    }
  };

  if (copyStaff) {
    STAFF_BCC.forEach(addBcc);
    if (fromEmail) addBcc(fromEmail);
  }
  const extraBcc = Array.isArray(bcc) ? bcc : bcc ? [bcc] : [];
  extraBcc.forEach(addBcc);

  const message = {
    from_email: fromEmail || "sales@statsurgicalsupply.com",
    subject,
    html,
    headers: headers || {},
    to: [
      { email: toEmail, type: "to" },
      ...bccRecipients.map((email) => ({ email, type: "bcc" })),
    ],
  };

  if (attachment) {
    message.attachments = [
      {
        type: attachment.type, // MIME type
        name: attachment.name,
        content: attachment.content, // Base64 string
      },
    ];
  }

  return client.messages.send({ message });
}
