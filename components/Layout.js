import Head from 'next/head';
import React from 'react';
import Header from './Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './Footer';
import { Analytics } from '@vercel/analytics/react';
import { generateJSONLD, generateProductJSONLD } from '../utils/seo';
import Logo from '../public/images/assets/logo2.png';

export default function Layout({ title, children, news, product }) {
  return (
    <div className="w-full" lang="en">
      <Analytics />
      <Head lang="en">
        <title>{title ? title : 'STAT'}</title>
        <meta name="description" content="Surgical Supplies at low price" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://www.statsurgicalsupply.com/" />
        <link
          rel="alternate"
          type="application/ld+json"
          href="/api/featuredProductsJSONLD"
        />
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
        <meta property="og:title" content="Stat Surgical Supply" />
        <meta
          property="og:description"
          content="Surgical supplies with low price"
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={Logo} />
        <meta property="og:url" content="https://www.statsurgicalsupply.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@statsurgicalsupply" />
        <meta name="twitter:title" content="Stat Surgical Supply" />
        <meta
          name="twitter:description"
          content="Surgical supplies with low price"
        />
        <meta name="twitter:image" content={Logo} />
      </Head>
      <ToastContainer position="bottom-center" limit={1} />
      <div className="flex min-h-screen flex-col justify-between">
        <Header />

        <main className="main container  m-auto mt-11 px-4">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
