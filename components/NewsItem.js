import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const NewsItem = ({ news }) => {
  return (
    <div className="justify-between flex flex-row items-center text-center mb-3 text-xs lg:text-lg max-w-full gap-2 border border-opacity-10 border-b-2 border-r-2 rounded-lg rounded-tl-2xl">
      <div className="flex flex-col justify-center items-center ">
        <Link
          href={{ pathname: `news/${news.slug}` }}
          className="justify-center items-center text-center"
        >
          <div className="">
            <Image
              src={`${news.imageUrl}`}
              alt={news.slug}
              className="news-image rounded-2xl"
              width={300}
              height={200}
            />
          </div>
        </Link>
        <div className="max-w-full text-center">
          <div className="text-4xl font-bold">
            {new Date(news.createdAt).getDate()}
          </div>
          <div className="text-lg">
            {new Date(news.createdAt).toLocaleDateString('en-US', {
              month: 'long',
            })}
          </div>
          <div className="text-lg">
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
            <br />
          </h2>

          <br />
          <div className=" max-w-full">{news.slug}</div>
        </Link>
      </div>
    </div>
  );
};
