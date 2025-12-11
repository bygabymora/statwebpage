import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export const NewsItem = ({ news }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const handleVideoPlay = () => {
    if (videoRef.current && isHovered) {
      videoRef.current.currentTime = 0;
      videoRef.current.volume = 0.7; // Set volume to 70%
      videoRef.current.play().catch(console.error);
    }
  };

  const handleVideoLoad = () => {
    if (isHovered) {
      handleVideoPlay();
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        handleVideoPlay();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered]);

  return (
    <div className='flex flex-col border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 w-full h-full'>
      <Link
        href={`/news/${news.slug}`}
        className='w-full aspect-[18/11] relative group'
        title={news.title}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={news.imageUrl}
          alt={news.title}
          title={news.title}
          fill
          className={`object-cover transition-all duration-300 ${
            news.hasVideo && isHovered
              ? "opacity-0 scale-105"
              : "group-hover:scale-105 opacity-100"
          }`}
        />
        {news.hasVideo && (
          <>
            <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded z-10 flex items-center gap-1'>
              🔊 VIDEO
            </div>
            <div className='absolute inset-0 w-full h-full overflow-hidden'>
              <video
                ref={videoRef}
                src={news.videoUrl}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                loop
                playsInline
                preload='auto'
                onLoadedData={handleVideoLoad}
                onError={(e) => console.error("Video error:", e)}
              />
            </div>
          </>
        )}
      </Link>

      <div className='flex flex-col justify-between p-4 h-full'>
        <div>
          <Link href={`/news/${news.slug}`}>
            <h4 className='text-lg font-semibold text-[#0e355e] hover:underline my-1'>
              {news.title}
            </h4>
          </Link>
          <p className='text-gray-600 text-sm mt-1 line-clamp-3'>
            {news.excerpt}
          </p>
        </div>
        <div className='mt-3 text-lg font-semibold text-gray-500'>
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
