// components/recaptcha/ReCaptchaV2Checkbox.js
import React, { useCallback } from "react";
import dynamic from "next/dynamic";

// Cargamos el componente de reCAPTCHA solo en el cliente (sin SSR)
const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), {
  ssr: false,
});

/**
 * ReCaptcha v2 checkbox (visible)
 *
 * Props:
 *  - id: string (solo para identificar, no es obligatorio)
 *  - onChange: function(token | null)
 */
export default function ReCaptchaV2Checkbox({ id, onChange }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY;

  const handleChange = useCallback(
    (token) => {
      // token puede ser string o null
      onChange?.(token || null);
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
    <div className='mt-4'>
      <ReCAPTCHA sitekey={siteKey} onChange={handleChange} id={id} />
    </div>
  );
}
