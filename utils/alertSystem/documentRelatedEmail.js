import DocumentComponent from "../../components/mailChimp/document/Component";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

const handleSendEmails = async (message, contact) => {
  let response;
 const headersToSend = "X-WpEmail";

  try {
      const templateHtml = renderToStaticMarkup(
        <DocumentComponent message={message} contact={contact} />
      );
      console.log("Sending email with payload:", message);

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
      res.status(500).json({ success: false, error: "Error sending email" });
      console.error("Error sending email:", error?.response?.data || error.message || error);
    return response;
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};

export default handleSendEmails;
