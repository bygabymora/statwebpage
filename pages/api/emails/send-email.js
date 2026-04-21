import mailchimp from "@mailchimp/mailchimp_transactional";

const normalizeText = (value) =>
  (value || "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

const createRequestId = () =>
  `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const logEmailFailure = (requestId, stage, details = {}) => {
  console.error("[EMAIL_SEND_FAILED]", {
    requestId,
    stage,
    ...details,
  });
};

const extractMeaningfulText = (value) =>
  normalizeText(
    (value || "")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " "),
  );

export default async function handler(req, res) {
  const requestId = createRequestId();

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
  const payloadMeta = {
    toEmail: normalizedToEmail || "(empty)",
    fromEmail: normalizedFromEmail || "(default)",
    subjectLength: normalizedSubject.length,
    htmlLength: normalizedHtmlContent.length,
  };

  if (!normalizedToEmail || !isValidEmail(normalizedToEmail)) {
    logEmailFailure(requestId, "validation", {
      reason: "invalid_or_missing_recipient_email",
      ...payloadMeta,
    });
    return res.status(400).json({
      success: false,
      error: "Invalid or missing recipient email",
      requestId,
    });
  }

  if (normalizedFromEmail && !isValidEmail(normalizedFromEmail)) {
    logEmailFailure(requestId, "validation", {
      reason: "invalid_sender_email",
      ...payloadMeta,
    });
    return res.status(400).json({
      success: false,
      error: "Invalid sender email",
      requestId,
    });
  }

  if (!normalizedSubject) {
    logEmailFailure(requestId, "validation", {
      reason: "missing_subject",
      ...payloadMeta,
    });
    return res
      .status(400)
      .json({ success: false, error: "Missing email subject", requestId });
  }

  if (!normalizedHtmlContent) {
    logEmailFailure(requestId, "validation", {
      reason: "missing_html_content",
      ...payloadMeta,
    });
    return res
      .status(400)
      .json({ success: false, error: "Missing email content", requestId });
  }

  if (extractMeaningfulText(normalizedHtmlContent).length < 10) {
    logEmailFailure(requestId, "validation", {
      reason: "non_meaningful_html_content",
      ...payloadMeta,
    });
    return res.status(400).json({
      success: false,
      error: "Email content is empty or not meaningful",
      requestId,
    });
  }

  // Check if the Mailchimp API key is available
  if (!process.env.MAILCHIMP_TRANSACTIONAL_API_KEY) {
    logEmailFailure(requestId, "configuration", {
      reason: "missing_mailchimp_api_key",
      ...payloadMeta,
    });
    return res
      .status(500)
      .json({ success: false, message: "API key is missing.", requestId });
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
      logEmailFailure(requestId, "provider_rejected", {
        reason: response[0].reject_reason || "rejected",
        providerStatus: response[0]?.status,
        providerResponse: response[0],
        ...payloadMeta,
      });
      return res.status(400).json({
        success: false,
        error: response[0].reject_reason,
        requestId,
      });
    }

    res.status(200).json({ success: true, data: response, requestId });
  } catch (error) {
    logEmailFailure(requestId, "provider_exception", {
      errorMessage: error?.message || "Unknown error",
      errorStack: error?.stack,
      providerResponse: error?.response?.data,
      ...payloadMeta,
    });
    res
      .status(500)
      .json({ success: false, error: "Error sending email", requestId });
  }
}
