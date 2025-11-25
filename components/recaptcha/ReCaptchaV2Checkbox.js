// components/recaptcha/ReCaptchaV2Checkbox.js
import React, { useCallback } from "react";
import dynamic from "next/dynamic";

// We load the reCAPTCHA component only on the client (without SSR)
const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), {
  ssr: false,
});

/**
 * ReCaptcha v2 checkbox (visible)
 *
 * Props:
 *  - id: string (only for identification, optional)
 *  - onChange: function(token | null)
 */
export default function ReCaptchaV2Checkbox({ id = "recaptcha-v2", onChange }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY;

  const handleChange = useCallback(
    (token) => {
      onChange?.(token || null); // string or null
    },
    [onChange]
  );

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
    <div className='mt-4 flex justify-center'>
      {/* wrapper to scale the widget on mobile devices */}
      <div id={id} className='recaptcha-wrapper'>
        <ReCAPTCHA sitekey={siteKey} onChange={handleChange} />
      </div>
    </div>
  );
}
