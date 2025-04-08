import React, { useEffect } from 'react';
import '../styles/global.css';
import StoreProvider from '../utils/Store';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import CookieAcceptancePopup from '../components/CookieAcceptancePopup';
import Script from 'next/script';
import { reportWebVitals } from '../utils/reportWebVitals';
import { ModalProvider } from '../components/context/ModalContext';
import axios from 'axios';

if (typeof window !== 'undefined') {
  axios.interceptors.request.use((request) => {
    console.log('📡 Axios Request:', request.method, request.url);
    return request;
  });
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      window.gtag('config', 'G-3JJZVPL0B5', {
        page_path: url,
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <SessionProvider session={session}>
      <ModalProvider>
        <StoreProvider>
          <CookieAcceptancePopup />
          <Script
            strategy="afterInteractive"
            src="https://www.googletagmanager.com/gtag/js?id=G-3JJZVPL0B5"
            async
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3JJZVPL0B5');
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
      </ModalProvider>
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
export { reportWebVitals };
