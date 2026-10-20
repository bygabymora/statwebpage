import { buildEmailHtml } from "./documentRelatedEmail";
import {
  isValidEmail,
  normalizeText,
  sendTransactionalEmail,
} from "./sendTransactionalEmail";

// Server-side: builds the email for a messageManagement message and sends it.
// The message's content must already be escaped (see escapeHtml).
// Options: attachment, bcc, and copyStaff (see sendTransactionalEmail).
export async function sendEmailMessage(
  message,
  contact,
  accountOwner,
  { attachment, bcc, copyStaff } = {},
) {
  const toEmail = normalizeText(contact?.email).toLowerCase();
  if (!isValidEmail(toEmail)) {
    throw new Error("Invalid or missing recipient email");
  }

  const subject = normalizeText(message?.subject);
  if (!subject || !message?.p1) {
    throw new Error("Invalid or empty email content");
  }

  const { fromEmail, htmlContent } = buildEmailHtml(
    message,
    contact,
    accountOwner,
  );
  const [result] = await sendTransactionalEmail({
    toEmail,
    fromEmail,
    subject,
    html: htmlContent,
    headers: { "X-WpEmail": true },
    attachment,
    bcc,
    copyStaff,
  });
  if (result?.status === "rejected") {
    throw new Error(`Email rejected: ${result.reject_reason}`);
  }
  return result;
}
