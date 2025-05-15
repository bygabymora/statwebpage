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
      fromEmail: "gaby@statsurgicalsupply.com",
      subject: message.subject,
      htmlContent: templateHtml,
      headers: {
        [headersToSend]: true,
      },
    };
    if (accountOwner !== null) {
      const signature = SignatureTemplate({ userInfo: accountOwner });
      const finalHtml = ContactTemplate({
        message: templateHtml,
        signature: signature,
      });
      payload = {
        toEmail: contact.email,
        fromEmail: accountOwner.email,
        subject: message.subject,
        htmlContent: finalHtml,
        headers: {
          [headersToSend]: true,
        },
      };
    }

    response = await fetch("/api/emails/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};

export default handleSendEmails;
