import ResponsiveImage from "../ui/ResponsiveImage";

/**
 * LCPProductImage
 * - Maintains a stable area (no CLS) with aspect-ratio
 * - Marks the image as LCP (preload + fetchpriority=high)
 * - Adjust sizes to approximately 800x1000 (4/5)
 */
export default function LCPProductImage({
  src,
  alt = "",
  className = "w-full max-w-[800px] mx-auto",
}) {
  return (
    <div className={className}>
      <ResponsiveImage
        src={src}
        alt={alt}
        preset='hero'
        aspectRatio='4 / 5' // 800x1000
        className='w-full'
        lcp // <- key for LCP
        quality={70}
        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 800px'
      />
    </div>
  );
}
