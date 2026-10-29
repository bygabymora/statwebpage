import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Default `sizes` matches the 1 / sm:2 / lg:3 column grids on /news and /news/video
export const NewsItem = ({
  news,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const playPromiseRef = useRef(null);

  const safePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;

    const p = video.play();
    playPromiseRef.current = p;

    if (p !== undefined) {
      p.catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });
    }
  };

  const safePause = () => {
    const video = videoRef.current;
    if (!video) return;

    const p = playPromiseRef.current;
    if (p !== undefined && p !== null) {
      // Wait for play() to finish before pausing
      p.then(() => {
        video.pause();
        video.currentTime = 0;
      }).catch(() => {
        // play() failed or was aborted, nothing to pause
      });
      playPromiseRef.current = null;
    } else {
      video.pause();
      video.currentTime = 0;
    }
  };

  useEffect(() => {
    if (isHovered) {
      safePlay();
    } else {
      safePause();
    }
  }, [isHovered]);

  return (
    <div className='flex flex-col border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 w-full h-full'>
      <Link
        href={`/news/${news.slug}`}
        className='w-full aspect-18/11 relative group'
        title={news.title}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={news.imageUrl}
          alt={news.title}
          title={news.title}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover transition-all duration-300 ${
            news.hasVideo && isHovered ?
              "opacity-0 scale-105"
            : "group-hover:scale-105 opacity-100"
          }`}
        />
        {news.hasVideo && (
          <>
            <div className='absolute top-2 right-2 bg-[#0e355e] text-white px-2 py-1 text-xs rounded-sm z-10 flex items-center gap-1'>
              🔊 VIDEO
            </div>
            {/* Play Button Overlay */}
            <div className='absolute inset-0 flex items-center justify-center z-20 pointer-events-none'>
              <div
                className={`rounded-full p-3 transition-all duration-300 ${
                  isHovered ? "scale-110 bg-black/80" : "scale-100 bg-black/60"
                }`}
              >
                <div className='w-0 h-0 border-t-8 border-t-transparent border-l-14 border-l-white border-b-8 border-b-transparent ml-1'></div>
              </div>
            </div>
            {/* Video Preview on Hover */}
            <div className='absolute inset-0 w-full h-full overflow-hidden'>
              <video
                ref={videoRef}
                src={news.videoUrl}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                loop
                muted
                playsInline
                preload='none'
                onError={(e) => console.error("Video error:", e)}
              />
            </div>
          </>
        )}
      </Link>

      <div className='flex flex-col justify-between p-4 h-full text-left'>
        <div>
          <Link href={`/news/${news.slug}`}>
            <h2 className='text-lg font-semibold text-[#0e355e] hover:underline my-3 text-left'>
              {news.title}
            </h2>
          </Link>
          <p className='text-gray-600 text-sm mt-1 line-clamp-3 text-left'>
            {news.excerpt}
          </p>
        </div>
        <div className='mt-3 flex justify-between text-sm text-gray-500'>
          <span>By {news.author}</span>
          <time dateTime={news.createdAt}>
            {new Date(news.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>
      </div>
    </div>
  );
};
