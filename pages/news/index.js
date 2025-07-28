import React from "react";
import Link from "next/link";
import Layout from "../../components/main/Layout";
import { NewsItem } from "../../components/NewsItem";
import New from "../../models/News.js";
import db from "../../utils/db";
import { BsChevronRight } from "react-icons/bs";

export default function News({ news }) {
  // Sort the news array by createdAt in descending order (latest first)
  news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const breadcrumbs = [{ href: "/", name: "Home" }, { name: "News" }];

  return (
    <Layout title='News Of Health' news={news}>
      <nav className='text-sm text-gray-700 -mt-2 mb-6'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#0e355e]'
                >
                  {breadcrumb.name}
                </Link>
              ) : (
                <span>{breadcrumb.name}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className='mx-2 text-gray-500' />
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className='text-center -mt-2'>
        <h2 className='section__title' id='news'>
          What you might have missed
        </h2>
        <p className='text-center my-2'>
          Here are some of the latest news from the world of health.
        </p>
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
