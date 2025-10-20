import mailchimp from "@mailchimp/mailchimp_transactional";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { toEmail, fromEmail, subject, htmlContent, headers, attachment } =
    req.body;

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

    const message = {
      from_email: fromEmail ? fromEmail : "sofi@statsurgicalsupply.com",
      subject: subject,
      html: htmlContent,
      headers: headers || {},
      to: [
        { email: toEmail, type: "to" },
        { email: "sofi@statsurgicalsupply.com", type: "bcc" },
        { email: "sofi@statsurgicalsupply.com", type: "bcc" },
        { email: fromEmail, type: "bcc" },
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
      error.response?.data || error.message || error
    );
    res.status(500).json({ success: false, error: "Error sending email" });
  }
}
