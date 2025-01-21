import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const NewsItem = ({ news }) => {
  return (
    <div className="flex flex-row justify-between items-center text-center mb-3 text-xs lg:text-lg max-w-full gap-3 border border-gray-200 shadow-lg rounded-lg p-4 hover:shadow-xl  transition-shadow duration-300 ease-in-out">
      <div className="flex flex-col justify-center items-center">
        <Link
          href={{ pathname: `news/${news.slug}` }}
          className="group flex justify-center items-center text-center"
        >
          <div className="p-2"> 
            <Image
              src={`${news.imageUrl}`}
              alt={news.slug}
              className="news-image rounded-lg group-hover:scale-105 transition-transform duration-300 ease-in-out" 
              width={300}
              height={200}
            />
          </div>
        </Link>
        <div className="max-w-full text-center mt-2">
          <div className="text-4xl font-bold text-[#144e8b]">
            {new Date(news.createdAt).getDate()}
          </div>
          <div className="font-bold">
            {new Date(news.createdAt).toLocaleDateString('en-US', {
              month: 'long',
            })}
          </div>
          <div className="font-bold">
            {new Date(news.createdAt).getFullYear()}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center w-[150px] md:w-[300px]">
        <Link
          href={{ pathname: `news/${news.slug}` }}
          className="justify-center items-center text-center"
        >
          <h2 className="font-bold">
            {news.title}
            <br/>
          </h2>
          <br/>
          <div className="max-w-full">{news.slug}</div>
        </Link>
      </div>
    </div>
  );
};
