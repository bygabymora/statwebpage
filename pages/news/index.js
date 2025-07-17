import React from "react";
import Link from "next/link";
import { HiArrowCircleLeft } from "react-icons/hi";
import Layout from "../../components/main/Layout";
import { NewsItem } from "../../components/NewsItem";
import New from "../../models/News.js";
import db from "../../utils/db";

export default function News({ news }) {
  // Sort the news array by createdAt in descending order (latest first)
  news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Layout title='News'>
      <div className='mb-1'>
        <Link
          href='/'
          className='inline-flex items-center text-[#144e8b] hover:text-[#0e3260] transition my-2'
        >
          <HiArrowCircleLeft className='mr-3' /> Home
        </Link>
      </div>
      <h2 className='section__title' id='news'>
        What you might have missed
      </h2>
      <p className='text-center'>
        Here are some of the latest news from the world of health.
      </p>
      <br />
      <div className='grid grid-cols-1 md:grid-cols-2'>
        {news.map((newsItem) => (
          <NewsItem news={newsItem} key={newsItem.slug}></NewsItem>
        ))}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect(true);
  const news = await New.find().lean();

  // Convert _id, createdAt, updatedAt in sources to string and createdAt to ISO date strings
  const newsWithModifiedFields = news.map((newsItem) => {
    const sourcesWithModifiedFields = newsItem.sources.map((source) => {
      const { _id, createdAt, updatedAt, ...rest } = source;
      const modifiedSource = {
        ...rest,
        _id: _id.toString(),
      };
      if (createdAt) {
        modifiedSource.createdAt = createdAt.toISOString();
      }
      if (updatedAt) {
        modifiedSource.updatedAt = updatedAt.toISOString();
      }
      return modifiedSource;
    });

    const { _id, createdAt, updatedAt, ...rest } = newsItem;
    const modifiedNewsItem = {
      ...rest,
      _id: _id.toString(),
      sources: sourcesWithModifiedFields,
    };
    if (createdAt) {
      modifiedNewsItem.createdAt = createdAt.toISOString();
    }
    if (updatedAt) {
      modifiedNewsItem.updatedAt = updatedAt.toISOString();
    }
    return modifiedNewsItem;
  });

  return {
    props: {
      news: newsWithModifiedFields,
    },
  };
}
