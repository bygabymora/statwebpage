import ContactTemplate from "../../components/mailChimp/ContactTemplate";
import DocumentComponent from "../../components/mailChimp/document/Component";
import SignatureTemplate from "../../components/mailChimp/document/Signatures";

// Server-only: emails are built and sent by the API (see sendEmailMessage);
// the browser asks for one with requestEmail.

const normalizeText = (value) =>
  (value || "").replace(/[​-‍﻿]/g, "").trim();

// Wraps the message in the email template, signed by the account owner
// (and sent from their address) when one is given.
export const buildEmailHtml = (message, contact, accountOwner) => {
  const bodyHtml = normalizeText(DocumentComponent({ message, contact }));

  if (accountOwner?.email && accountOwner?.name) {
    const signature = SignatureTemplate({ userInfo: accountOwner });
    return {
      bodyHtml,
      fromEmail: accountOwner.email,
      htmlContent: ContactTemplate({ message: bodyHtml, signature }),
    };
  }

  return {
    bodyHtml,
    fromEmail: "sales@statsurgicalsupply.com",
    htmlContent: bodyHtml,
  };
};
