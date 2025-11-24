// components/recaptcha/ReCaptchaV2Checkbox.js
import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function ReCaptchaV2Checkbox({ onChange }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY;
  const widgetIdRef = useRef(null);
  const [apiLoaded, setApiLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey || !apiLoaded) return;
    if (typeof window === "undefined") return;
    if (!window.grecaptcha || !window.grecaptcha.render) return;
    if (widgetIdRef.current !== null) return;

    widgetIdRef.current = window.grecaptcha.render("recaptcha-v2-container", {
      sitekey: siteKey,
      callback: (token) => {
        // Triggered when the user checks the checkbox correctly
        onChange?.(token || null);
      },
      "expired-callback": () => {
        onChange?.(null);
      },
      "error-callback": () => {
        onChange?.(null);
      },
    });
  }, [apiLoaded, siteKey, onChange]);

  if (!siteKey || siteKey.trim() === "") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[reCAPTCHA v2] Missing NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY. " +
          "Add it to .env.local or Vercel → Environment Variables."
      );
    }
    return null;
  }

  return (
    <>
      <Script
        src='https://www.google.com/recaptcha/api.js?render=explicit'
        strategy='lazyOnload'
        onLoad={() => setApiLoaded(true)}
      />
      <div id='recaptcha-v2-container' className='mt-4' />
    </>
  );
}
