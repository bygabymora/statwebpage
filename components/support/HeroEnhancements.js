"use client";

import React, { useEffect, useState } from "react";
import { FaHeadset, FaPhone, FaEnvelope } from "react-icons/fa";

export default function HeroEnhancements() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Enhance the icon placeholder */}
      <style jsx global>{`
        .hero-icon-placeholder {
          opacity: 0;
          animation: fadeIn 0.3s ease-in-out 0.1s forwards;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Enhance hero icon
            const iconPlaceholder = document.querySelector('.hero-icon-placeholder');
            if (iconPlaceholder) {
              iconPlaceholder.innerHTML = '<svg className="text-4xl text-[#0e355e]" viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>';
              iconPlaceholder.classList.add('hero-icon-placeholder');
            }
            
            // Enhance CTA buttons with icons
            const phoneButton = document.querySelector('a[href^="tel:"]');
            if (phoneButton && !phoneButton.querySelector('svg')) {
              phoneButton.innerHTML = '<svg className="mr-2" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>' + phoneButton.innerHTML;
            }
            
            const emailButton = document.querySelector('a[href^="mailto:"]');
            if (emailButton && !emailButton.querySelector('svg')) {
              emailButton.innerHTML = '<svg className="mr-2" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>' + emailButton.innerHTML;
            }
          `,
        }}
      />
    </>
  );
}
