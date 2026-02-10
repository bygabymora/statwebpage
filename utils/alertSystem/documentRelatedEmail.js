import ContactTemplate from "../../components/mailChimp/ContactTemplate";
import DocumentComponent from "../../components/mailChimp/document/Component";
import SignatureTemplate from "../../components/mailChimp/document/Signatures";

const handleSendEmails = async (message, contact, accountOwner) => {
  let response;
  const headersToSend = "X-WpEmail";

  try {
    const templateHtml = DocumentComponent({
      message,
      contact,
    });

    let payload = {
      toEmail: contact.email,
      fromEmail: "sales@statsurgicalsupply.com",
      subject: message.subject,
      htmlContent: templateHtml,
      headers: {
        [headersToSend]: true,
      },
    };
    const accountOwnerEmail = accountOwner?.email;
    const accountOwnerName = accountOwner?.name;
    if (accountOwnerEmail && accountOwnerName) {
      const signature = SignatureTemplate({ userInfo: accountOwner });
      const finalHtml = ContactTemplate({
        message: templateHtml,
        signature: signature,
      });
      payload = {
        toEmail: contact.email,
        fromEmail: accountOwnerEmail,
        subject: message.subject,
        htmlContent: finalHtml,
        headers: {
          [headersToSend]: true,
        },
      };
    }

    // Construct absolute URL for server-side fetch
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.VERCEL_URL ||
      "https://www.statsurgicalsupply.com";
    const emailUrl = `${baseUrl}/api/emails/send-email`;

    response = await fetch(emailUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    console.error("Error sending emails:", error);
    throw error;
  }
};

export default handleSendEmails;
