// pages/news/index.js

import React from "react";
import Link from "next/link";
import Layout from "../../components/main/Layout";
import { NewsItem } from "../../components/NewsItem";
import New from "../../models/News.js";
import db from "../../utils/db";
import { BsChevronRight, BsPlay } from "react-icons/bs";
import { generateNewsPageJSONLD } from "../../utils/seo";

export default function News({ news }) {
  // Sort the news array by createdAt in descending order (latest first)
  news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const breadcrumbs = [{ href: "/", name: "Home" }, { name: "News" }];

  return (
    <Layout
      title='News Of Health | Stat Surgical Supply'
      news={news}
      schema={generateNewsPageJSONLD(news)}
    >
      <nav className='text-sm text-gray-700'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2 -mt-6'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ?
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#0e355e]'
                >
                  {breadcrumb.name}
                </Link>
              : <span>{breadcrumb.name}</span>}
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className='mx-2 text-gray-500' />
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className='text-center mt-5'>
        <h1
          id='news'
          className='section__title text-4xl md:text-5xl font-bold tracking-tight'
        >
          Health & Surgical News <br />
          <span className='text-[#0e355e]'>
            Latest FDA Alerts and Industry Updates
          </span>
        </h1>
        <p className='text-lg my-5'>
          Here are some of the latest news from the world of health.
        </p>

        {/* News Navigation */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mt-6 mb-8'>
          <Link
            href='/news/video'
            className='inline-flex items-center gap-2 px-6 py-3 bg-[#0e355e] text-white rounded-lg hover:bg-[#1a4872] transition-colors duration-200 font-medium'
          >
            <BsPlay className='text-lg' />
            Watch Video News
          </Link>
          <span className='text-gray-400 hidden sm:block'>|</span>
          <span className='text-gray-600 font-medium'>
            Browse all health industry news and updates
          </span>
        </div>
      </div>
      <div className='text-center my-9 border-t border-gray-200'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-5'>
          {news.map((newsItem) => (
            <NewsItem news={newsItem} key={newsItem.slug} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect(true);
  const news = await New.find(
    {},
    {
      title: 1,
      slug: 1,
      imageUrl: 1,
      author: 1,
      createdAt: 1,
      content: 1,
      hasVideo: 1,
      videoUrl: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();

  const newsWithModifiedFields = news.map((newsItem) => {
    const excerptText =
      newsItem.content ?
        newsItem.content.replace(/(\r\n|\n|\r)/gm, " ").slice(0, 180)
      : "";

    return {
      title: newsItem.title,
      slug: newsItem.slug,
      imageUrl: newsItem.imageUrl,
      author: newsItem.author,
      createdAt: newsItem.createdAt ? newsItem.createdAt.toISOString() : null,
      excerpt: excerptText ? `${excerptText}...` : "",
      hasVideo: Boolean(newsItem.hasVideo),
      videoUrl: newsItem.videoUrl || null,
    };
  });

  return {
    props: {
      news: newsWithModifiedFields,
    },
  };
}
