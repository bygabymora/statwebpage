import React from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function ReCaptchaProvider({ children }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey || siteKey.trim() === "") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[reCAPTCHA] Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY. " +
          "Add the public key in .env.local (for development) or in Vercel → Environment Variables and redeploy."
      );
    }
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{ async: true, defer: true, appendTo: "head" }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
