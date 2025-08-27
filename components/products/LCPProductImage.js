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
  containerClassName = "w-full max-w-[800px] mx-auto",
  className = "w-full",
  aspectRatio = "4 / 5",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 800px",
  quality = 70,
  // puedes pasar lcp o priority desde fuera
  lcp = false,
  priority = false,
  title,
  onContextMenu,
  onDragStart,
}) {
  const isPriority = Boolean(lcp || priority);
  return (
    <div
      className={containerClassName}
      title={title}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
    >
      <ResponsiveImage
        src={src}
        alt={alt}
        preset='hero'
        aspectRatio={aspectRatio} // 800x1000
        className={className}
        priority={isPriority}
        quality={quality}
        sizes={sizes}
      />
    </div>
  );
}
