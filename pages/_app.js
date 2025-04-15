import React, { useEffect } from 'react';
import '../styles/global.css';
import StoreProvider from '../utils/Store';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import CookieAcceptancePopup from '../components/CookieAcceptancePopup';
import Script from 'next/script';
import { reportWebVitals } from '../utils/reportWebVitals';
import { ModalProvider } from '../components/context/ModalContext';

// Lazy-load PayPalScriptProvider ONLY when needed
const LazyPayPalScriptProvider = dynamic(
  () => import('@paypal/react-paypal-js').then((mod) => mod.PayPalScriptProvider),
  { ssr: false }
);

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const isProd = process.env.NODE_ENV === 'production';

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (window.gtag) {
        window.gtag('config', 'G-3JJZVPL0B5', {
          page_path: url,
        });
      }
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

          {isProd && (
            <>
              <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-3JJZVPL0B5"
                strategy="afterInteractive"
              />
              <Script id="gtag-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-3JJZVPL0B5', {
                    page_path: window.location.pathname,
                  });
                `}
              </Script>
            </>
          )}

          {Component.usePayPal ? (
            <LazyPayPalScriptProvider deferLoading={true}>
              {Component.auth ? (
                <Auth adminOnly={Component.auth.adminOnly}>
                  <Component {...pageProps} />
                </Auth>
              ) : (
                <Component {...pageProps} />
              )}
            </LazyPayPalScriptProvider>
          ) : Component.auth ? (
            <Auth adminOnly={Component.auth.adminOnly}>
              <Component {...pageProps} />
            </Auth>
          ) : (
            <Component {...pageProps} />
          )}
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

  if (status === 'loading') return <div>Loading...</div>;

  if (adminOnly && !session.user?.isAdmin) {
    router.push('/unauthorized?message=Admin login required to access page');
    return <div>Redirecting...</div>;
  }

  return children;
}

export default MyApp;
export { reportWebVitals };
