import Head from 'next/head';
import React from 'react';
import Header from './Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './Footer';
import { Analytics } from '@vercel/analytics/react';
import { generateJSONLD, generateProductJSONLD } from '../utils/seo';

export default function Layout({ title, children, news, product }) {
  return (
    <div className="w-full">
      <Head>
        <title>{title ? title : 'STAT'}</title>
        <meta name="surgical supplies" content="Surgical Supplies" />
        <link rel="icon" href="/favicon.ico" />
        {news && (
          <>
            <meta name="description" content={news.content.substring(0, 160)} />
            <meta name="keywords" content={news.tags.join(', ')} />
            <meta property="og:title" content={news.title} />
            <meta
              property="og:description"
              content={news.content.substring(0, 200)}
            />
            <meta property="og:image" content={news.imageUrl} />
            <meta
              property="og:url"
              content={`https://www.statsurgicalsupply.com/news/${news.slug}`}
            />
            <meta property="og:type" content="article" />
            <link
              rel="canonical"
              href={`https://www.statsurgicalsupply.com/news/${news.slug}`}
            />
            <script type="application/ld+json">
              {JSON.stringify(generateJSONLD(news))}
            </script>
          </>
        )}
        {product && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateProductJSONLD(product)),
            }}
          />
        )}
      </Head>
      <ToastContainer position="bottom-center" limit={1} />
      <div className="flex min-h-screen flex-col justify-between">
        <Header />

        <main className="main container  m-auto mt-11 px-4">
          <Analytics />
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
