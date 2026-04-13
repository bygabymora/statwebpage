import ContactTemplate from "../../components/mailChimp/ContactTemplate";
import DocumentComponent from "../../components/mailChimp/document/Component";
import SignatureTemplate from "../../components/mailChimp/document/Signatures";

const handleSendEmails = async (message, contact, accountOwner) => {
  let response;
  const headersToSend = "X-WpEmail";

  // --- Email Tracker: log what we're about to send ---
  console.log("[Email Tracker] Preparing email for:", contact?.email);
  console.log("[Email Tracker] Subject:", message?.subject || "(EMPTY)");
  console.log("[Email Tracker] Has p1:", !!message?.p1);
  console.log("[Email Tracker] Has p2:", !!message?.p2);
  console.log("[Email Tracker] Has p3:", !!message?.p3);

  if (!message?.subject || !message?.p1) {
    console.warn(
      "[Email Tracker] WARNING: Email message appears empty!",
      JSON.stringify({
        subject: message?.subject,
        p1: !!message?.p1,
        p2: !!message?.p2,
        p3: !!message?.p3,
      }),
    );
  }

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
    throw error;
  }
};

export default handleSendEmails;
