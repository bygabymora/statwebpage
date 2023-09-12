import React, { useEffect } from 'react';
import '../styles/global.css';
import StoreProvider from '../utils/Store';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import CookieAcceptancePopup from '../components/CookieAcceptancePopup';
import ReactGA from 'react-ga';
import Script from 'next/script';

// Initialize Google Analytics with your tracking ID
ReactGA.initialize('G-DZ8WE2HZH9', {
  gaOptions: {
    anonymizeIp: true, // Optional: Mask user IPs for GDPR compliance
  },
});

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    // Track page views
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return (
    <SessionProvider session={session}>
      <StoreProvider>
        <CookieAcceptancePopup />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=YOUR_ADS_TAG_ID"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'YOUR_ADS_TAG_ID');
    `}
        </Script>

        <PayPalScriptProvider deferLoading={true}>
          {Component.auth ? (
            <Auth adminOnly={Component.auth.adminOnly}>
              <Component {...pageProps} />
            </Auth>
          ) : (
            <Component {...pageProps} />
          )}
        </PayPalScriptProvider>
      </StoreProvider>
    </SessionProvider>
  );
}

function Auth({ children, adminOnly }) {
  const router = useRouter();
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/unauthorized?message=Login required');
    },
  });

  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  if (adminOnly && !session.user.isAdmin) {
    router.push('/unauthorized?message=Admin login required to access page');
    return <div>Redirecting...</div>;
  }

  return children;
}

export default MyApp;
