import React from "react";
import Image from "next/image";
import Link from "next/link";

export const NewsItem = ({ news }) => {
  return (
    <div className='flex flex-col md:flex-row justify-between items-center text-center mb-3 text-xs md:text-sm lg:text-lg max-w-full gap-3 border border-gray-200 shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300 ease-in-out'>
      <div className='flex flex-col justify-center items-center'>
        <Link
          href={{ pathname: `news/${news.slug}` }}
          className='group flex justify-center items-center text-center'
        >
          <div className='p-2'>
            <Image
              src={news.imageUrl}
              alt={news.slug}
              className='news-image rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300 ease-in-out'
              width={300}
              height={200}
              loading='lazy'
            />
          </div>
        </Link>
        <div className='max-w-full text-center'>
          <div className='max-w-full text-center mt-1 font-bold text-[#19426e]'>
            <time dateTime={news.createdAt}>
              {new Date(news.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </div>
      </div>
      <div className='flex flex-col justify-center items-center w-full md:w-[300px]'>
        <Link
          href={{ pathname: `news/${news.slug}` }}
          className='justify-center items-center text-center'
        >
          <h2 className='font-bold break-words'>
            {news.title}
            <br />
          </h2>
          <br />
          <div className='max-w-full'>{news.slug}</div>
        </Link>
      </div>
    </div>
  );
};
