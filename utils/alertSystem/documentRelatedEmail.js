import ReactDOMServer from "react-dom/server";
import DocumentComponent from "../../components/mailChimp/document/Component";

const handleSendEmails = async (message, contact) => {
  let response;
  const headersToSend = "X-WpEmail";

  try {
    const templateHtml = ReactDOMServer.renderToStaticMarkup(
      <DocumentComponent message={message} contact={contact} />
    );

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
  } catch (err) {
    console.error("Error sending emails:", err);
  }
};

export default handleSendEmails;
