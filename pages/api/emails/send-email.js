import mailchimp from "@mailchimp/mailchimp_transactional";

const normalizeText = (value) =>
  (value || "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { toEmail, fromEmail, subject, htmlContent, headers, attachment } =
    req.body;

  const normalizedToEmail = normalizeText(toEmail).toLowerCase();
  const normalizedFromEmail = normalizeText(fromEmail).toLowerCase();
  const normalizedSubject = normalizeText(subject);
  const normalizedHtmlContent = normalizeText(htmlContent);

  if (!normalizedToEmail || !isValidEmail(normalizedToEmail)) {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing recipient email",
    });
  }

  if (normalizedFromEmail && !isValidEmail(normalizedFromEmail)) {
    return res.status(400).json({
      success: false,
      error: "Invalid sender email",
    });
  }

  if (!normalizedSubject) {
    return res
      .status(400)
      .json({ success: false, error: "Missing email subject" });
  }

  if (!normalizedHtmlContent) {
    return res
      .status(400)
      .json({ success: false, error: "Missing email content" });
  }

  // Check if the Mailchimp API key is available
  if (!process.env.MAILCHIMP_TRANSACTIONAL_API_KEY) {
    console.error("Mailchimp API key is missing.");
    return res
      .status(500)
      .json({ success: false, message: "API key is missing." });
  }

  try {
    // Initialize Mailchimp client
    const client = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY);

    const bccRecipients = [
      "gaby@statsurgicalsupply.com",
      "sofi@statsurgicalsupply.com",
    ];
    if (normalizedFromEmail) {
      bccRecipients.push(normalizedFromEmail);
    }

    const message = {
      from_email: normalizedFromEmail || "sales@statsurgicalsupply.com",
      subject: normalizedSubject,
      html: normalizedHtmlContent,
      headers: headers || {},
      to: [
        { email: normalizedToEmail, type: "to" },
        ...bccRecipients.map((email) => ({ email, type: "bcc" })),
      ],
    };

    // Add attachment if provided
    if (attachment) {
      message.attachments = [
        {
          type: attachment.type, // MIME type
          name: attachment.name,
          content: attachment.content, // Base64 string
        },
      ];
    }

    // Send email using Mailchimp
    const response = await client.messages.send({ message });

    if (response[0]?.status === "rejected") {
      console.warn("Email rejected:", response[0].reject_reason);
      return res
        .status(400)
        .json({ success: false, error: response[0].reject_reason });
    }

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.data || error.message || error,
    );
    res.status(500).json({ success: false, error: "Error sending email" });
  }
}
