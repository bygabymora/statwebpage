import React from "react";
import Image from "next/image";

const PRESET_SIZES = {
  thumb: "(max-width: 640px) 40vw, (max-width: 1024px) 20vw, 135px",
  card: "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px",
  hero: "100vw",
};

export default function ResponsiveImage({
  src,
  alt = "",
  preset = "thumb",
  className = "",
  // Use CSS aspect-ratio to keep layout stable; default to ~4:5 (your 1800x2250)
  aspectRatio = "4 / 5", // ~1800x2250 looking
  lpc = false,
  priority = false,
  quality = 60,
  // Optional: pass a custom sizes if the preset isn't perfect for a page
  sizes,
  // If you already have a tiny base64, pass it. Otherwise we keep placeholder empty.
  blurDataURL,
}) {
  const computedSizes = sizes || PRESET_SIZES[preset] || PRESET_SIZES.thumb;
  const isPriority = Boolean(lpc || priority);

  return (
    <div
      className={className + " relative overflow-hidden rounded-md"}
      style={{ aspectRatio }}
    >
      <Image
        src={src}
        alt={alt}
        // `fill` + container aspect-ratio = no CLS and lets `sizes` work properly
        fill
        sizes={computedSizes}
        quality={quality}
        // Lazy by default; only set priority on true LCP/above-the-fold images
        priority={isPriority} // Next add <link rel="preload"> y NO use lazy
        fetchPriority={isPriority ? "high" : undefined}
        loading={isPriority ? "eager" : undefined}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
