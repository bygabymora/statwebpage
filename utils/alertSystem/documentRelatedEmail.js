import ContactTemplate from "../../components/mailChimp/ContactTemplate";
import DocumentComponent from "../../components/mailChimp/document/Component";
import SignatureTemplate from "../../components/mailChimp/document/Signatures";

const normalizeText = (value) =>
  (value || "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");

const extractMeaningfulText = (value) =>
  normalizeText(
    (value || "")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " "),
  );

const handleSendEmails = async (message, contact, accountOwner) => {
  let response;
  const headersToSend = "X-WpEmail";
  const toEmail = normalizeText(contact?.email || "").toLowerCase();
  const subject = normalizeText(message?.subject || "");

  if (!toEmail || !isValidEmail(toEmail)) {
    throw new Error("Invalid or missing recipient email");
  }

  if (!subject || !message?.p1) {
    throw new Error("Invalid or empty email content");
  }

  const composedText = extractMeaningfulText(
    `${message?.p1 || ""} ${message?.p2 || ""} ${message?.p3 || ""}`,
  );
  if (composedText.length < 10) {
    throw new Error("Email content is not meaningful");
  }

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
    const templateHtml = normalizeText(
      DocumentComponent({
        message,
        contact,
      }),
    );

    if (!templateHtml) {
      throw new Error("Email HTML content is empty");
    }

    if (extractMeaningfulText(templateHtml).length < 10) {
      throw new Error("Rendered email content is not meaningful");
    }

    let payload = {
      toEmail,
      fromEmail: "sales@statsurgicalsupply.com",
      subject,
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
        toEmail,
        fromEmail: accountOwnerEmail,
        subject,
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
