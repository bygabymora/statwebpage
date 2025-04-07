import DocumentComponent from "../../components/mailChimp/document/Component";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

const handleSendEmails = async (message, contact) => {
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
        "X-WpEmail": true,
      },
    };

    const response = await fetch("/api/emails/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await handleSendEmails(message, contact);
      if (!result?.success) {
      alert(`Error: ${result?.error?.message || "Unknown error"}`);
    }     

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error sending email:", errorData);
    }

    return response;
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};

export default handleSendEmails;