import Head from 'next/head';
import React, { useEffect } from 'react';
import Header from './Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './Footer';
import { Analytics } from '@vercel/analytics/react';
import {
  generateJSONLD,
  generateProductJSONLD,
  generateMainPageJSONLD,
} from '../../utils/seo';
import Logo from '../../public/images/assets/logo2.png';

import { signOut, useSession } from 'next-auth/react';
import { useModalContext } from '../context/ModalContext';
import { useRouter } from 'next/router';

export default function Layout({ title, children, news, product }) {
  const { data: session } = useSession();
  const { showStatusMessage, openAlertModal } = useModalContext();
  const router = useRouter();

  // Account not approved message
  const approvalMessage = {
    title: 'Account Verification',
    body: 'Thank you for trusting us and considering our services. We will work to approve your account within 24 hours.',
    warning: 'If it takes longer than expected, please contact us for more information. Thank you for choosing us!',
  };

  // Disabled account message
  const disabledMessage = {
    title: 'Account Disabled',
    body: 'Your account has been disabled. Please contact support for more information.',
    warning: 'If you believe this is an error, please reach out to customer service immediately.',
  };

  const redirectHandler = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  useEffect(() => {
    if (!session?.user) return;
  
    const { approved, active } = session.user;
  
    if (approved === false) {
      showStatusMessage('error', 'Thank you for trusting us and considering our services. We will work to approve your account within 24 hours.');
      openAlertModal(approvalMessage);
    } else if (active === false) {
      showStatusMessage('error', 'Your account has been disabled. Please contact support for more information.');
      openAlertModal(disabledMessage, async () => {
        await redirectHandler();
      });
  
      setTimeout(async () => {
        await redirectHandler();
      }, 5000);
    } 
  }, [session]);

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateMainPageJSONLD()),
          }}
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
        {console.log('session', session)}
        <Header />
        <main className="main container  m-auto mt-11 px-4">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
