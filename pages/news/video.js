// pages/news/video.js

import React from "react";
import Link from "next/link";
import Layout from "../../components/main/Layout";
import { NewsItem } from "../../components/NewsItem";
import New from "../../models/News.js";
import db from "../../utils/db";
import { BsChevronRight } from "react-icons/bs";
import { generateNewsPageJSONLD } from "../../utils/seo";

export default function VideoNews({ news }) {
  // Sort the news array by createdAt in descending order (latest first)
  news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const breadcrumbs = [
    { href: "/", name: "Home" },
    { href: "/news", name: "News" },
    { name: "Video News" },
  ];

  return (
    <Layout
      title='Video News | Latest Health Industry Videos | Stat Surgical Supply'
      description='Watch the latest video news and updates from the health and medical device industry. Stay informed with visual content from FDA alerts and industry updates.'
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
        <div className='flex items-center justify-center gap-3 mb-4'>
          <h1
            id='video-news'
            className='section__title text-4xl md:text-5xl font-bold tracking-tight'
          >
            Video News & Updates
          </h1>
        </div>
        <span className='text-[#0e355e] text-xl md:text-2xl font-semibold block mb-4'>
          Latest Health Industry Video Content
        </span>
        <p className='text-lg my-5 max-w-3xl mx-auto'>
          Stay informed with the latest video news from the health and medical
          device industry. Watch FDA alerts, industry updates, and breaking news
          in an engaging video format.
        </p>
      </div>

      {/* Video News Grid */}
      <div className='text-center my-9 border-t border-gray-200'>
        {news.length > 0 ?
          <>
            <div className='mt-8 mb-4 text-center'>
              <p className='text-gray-600 text-sm'>
                Click on any video news item below to watch the full video
              </p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {news.map((newsItem) => (
                <NewsItem news={newsItem} key={newsItem.slug} />
              ))}
            </div>
          </>
        : <div className='mt-12 text-center py-16'>
            <BsPlay className='mx-auto text-6xl text-gray-400 mb-4' />
            <h3 className='text-xl font-semibold text-gray-600 mb-2'>
              No Video News Available
            </h3>
            <p className='text-gray-500 mb-6'>
              We're currently working on bringing you video content. Check back
              soon!
            </p>
            <Link
              href='/news'
              className='inline-flex items-center px-6 py-3 bg-[#0e355e] text-white rounded-lg hover:bg-[#1a4872] transition-colors duration-200'
            >
              Browse All News
            </Link>
          </div>
        }
      </div>

      {/* Call to Action */}
      {news.length > 0 && (
        <div className='text-center mt-12 mb-8'>
          <Link
            href='/news'
            className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-[#0e355e] rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium'
          >
            View All News Articles
            <BsChevronRight />
          </Link>
        </div>
      )}
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect(true);

  // Filter to only get news items that have videos
  const news = await New.find({ hasVideo: true }).lean();

  const newsWithModifiedFields = news.map((newsItem) => {
    const sourcesWithModifiedFields = newsItem.sources.map((source) => {
      const { _id, createdAt, updatedAt, ...rest } = source;
      return {
        ...rest,
        _id: _id.toString(),
        createdAt: createdAt ? createdAt.toISOString() : null,
        updatedAt: updatedAt ? updatedAt.toISOString() : null,
      };
    });

    const { _id, createdAt, updatedAt, content, ...rest } = newsItem;

    // Generate an excerpt of maximum 250 characters
    const excerpt =
      content ?
        content.replace(/(\r\n|\n|\r)/gm, " ").slice(0, 250) + "..."
      : "";

    return {
      ...rest,
      _id: _id.toString(),
      createdAt: createdAt ? createdAt.toISOString() : null,
      updatedAt: updatedAt ? updatedAt.toISOString() : null,
      sources: sourcesWithModifiedFields,
      excerpt, // we add only a short summary
      videoUrl: newsItem.videoUrl || null,
      hasVideo: newsItem.hasVideo || false,
      videoType: newsItem.videoType || null,
    };
  });

  return {
    props: {
      news: newsWithModifiedFields,
    },
  };
}
