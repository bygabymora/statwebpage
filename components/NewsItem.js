import React from "react";
import Image from "next/image";
import Link from "next/link";

export const NewsItem = ({ news }) => {
  return (
    <div className='flex flex-col border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 w-full h-full'>
      <Link
        href={`/news/${news.slug}`}
        className='w-full aspect-[6/4] relative group'
        title={news.title}
      >
        <Image
          src={news.imageUrl}
          alt={news.title}
          title={news.title}
          fill
          className='object-cover group-hover:scale-105 transition-transform duration-300'
        />
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
