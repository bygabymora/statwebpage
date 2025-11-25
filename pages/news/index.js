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
    <Layout title='News Of Health | Stat Surgical Supply' news={news}>
      <nav className='text-sm text-gray-700'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2 -mt-6'>
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
      <div className='text-center mt-5'>
        <h1 className='section__title' id='news'>
          What you might have missed
        </h1>
        <h2 className='text-center my-2 text-base font-normal text-[#2c3339]'>
          Here are some of the latest news from the world of health.
        </h2>
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
    const excerpt = content
      ? content.replace(/(\r\n|\n|\r)/gm, " ").slice(0, 250) + "..."
      : "";

    return {
      ...rest,
      _id: _id.toString(),
      createdAt: createdAt ? createdAt.toISOString() : null,
      updatedAt: updatedAt ? updatedAt.toISOString() : null,
      sources: sourcesWithModifiedFields,
      excerpt, // we add only a short summary
    };
  });

  return {
    props: {
      news: newsWithModifiedFields,
    },
  };
}
