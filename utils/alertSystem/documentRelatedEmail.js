import DocumentComponent from "../../components/mailChimp/document/Component";

const handleSendEmails = async (message, contact) => {
  let response;
  const headersToSend = "X-WpEmail";

  try {
    const templateHtml = DocumentComponent({
      message,
      contact,
    });

    const payload = {
      toEmail: contact.email,
      subject: message.subject,
      htmlContent: templateHtml,
      headers: {
        [headersToSend]: true,
      },
    };

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
