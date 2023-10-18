import React from 'react';
import Layout from '../../components/Layout';
import { NewsItem } from '../../components/NewsItem';
import New from '../../models/News.js';
import db from '../../utils/db';

export default function News({ news }) {
  // Sort the news array by createdAt in descending order (latest first)
  news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Layout title="News">
      <h2 className="section__title" id="news">
        What you might have missed
      </h2>
      <p className="text-center">
        Here are some of the latest news from the world of health.
      </p>
      <br />
      <div className="grid grid-cols-1 md:grid-cols-2">
        {news.map((newsItem) => (
          <NewsItem news={newsItem} key={newsItem.slug}></NewsItem>
        ))}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const news = await New.find().select('-_id').lean();

  return {
    props: {
      news,
    },
  };
}
