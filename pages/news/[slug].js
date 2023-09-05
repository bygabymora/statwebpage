import React from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { BsBackspace } from 'react-icons/bs';
import db from '../../utils/db';
import News from '../../models/News';

export default function Newscreen(props) {
  const { news } = props;
  if (!news) {
    return <p>News not found</p>;
  }

  return (
    <Layout title={news.slug}>
      <div className="py-2">
        <Link href={'/news'} className="flex gap-4 items-center">
          <BsBackspace />
          Back to news.
        </Link>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();

  const news = await News.findOne({ slug }).lean();
  console.log('Fetched news:', news);
  await db.disconnect();

  return {
    props: {
      news: news ? db.convertDocToObj(news) : null,
    },
  };
}
