import React, { useEffect } from "react";
import "../styles/global.css";
import StoreProvider from "../utils/Store";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import CookieAcceptancePopup from "../components/CookieAcceptancePopup";
import Script from "next/script";
import { reportWebVitals } from "../utils/reportWebVitals";
import { ModalProvider } from "../components/context/ModalContext";
import { loadStripe } from "@stripe/stripe-js";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// Lazy-load PayPalScriptProvider ONLY when needed
const LazyPayPalScriptProvider = dynamic(
  () =>
    import("@paypal/react-paypal-js").then((mod) => mod.PayPalScriptProvider),
  { ssr: false }
);

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const isProd = process.env.NODE_ENV === "production";

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (window.gtag) {
        window.gtag("config", "G-3JJZVPL0B5", {
          page_path: url,
        });
      }
    };

    stripePromise.then((stripe) => {
      if (!stripe) {
        console.warn("Stripe failed to initialize correctly.");
      } else {
        console.log("Preloaded stripe");
      }
    });

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [router.asPath]);

  return (
    <SessionProvider session={session}>
      <ModalProvider>
        <StoreProvider>
          <CookieAcceptancePopup />
          <Analytics />
          <SpeedInsights />
          {isProd && (
            <>
              <Script
                src='https://www.googletagmanager.com/gtag/js?id=G-3JJZVPL0B5'
                strategy='lazyOnload'
              />
              <Script id='gtag-init' strategy='lazyOnload'>
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
      // send to our custom login page, preserve where they were going
      router.push(`/Login?redirect=${encodeURIComponent(router.asPath)}`);
    },
  });

  if (status === "loading") return <div>Loading...</div>;

  if (adminOnly && !session.user?.isAdmin) {
    // similarly, non-admins go to login (or you could send to /unauthorized if you prefer)
    router.push(`/Login?redirect=${encodeURIComponent(router.asPath)}`);
    return <div>Redirecting…</div>;
  }

  return children;
}
export default MyApp;
export { reportWebVitals };
