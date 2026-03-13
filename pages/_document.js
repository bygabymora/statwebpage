import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang='en-US'>
      <Head>
        <link
          rel='preconnect'
          href='https://fonts.googleapis.com'
          crossOrigin='anonymous'
        />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />

        {/* Consolidated font request — single HTTP round-trip instead of 3×2 */}
        <link
          rel='preload'
          href='https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Roboto:wght@400;500;600&family=Lato:wght@400;500;600&display=swap'
          as='style'
        />

        {/* Load fonts non-blocking */}
        <link
          href='https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Roboto:wght@400;500;600&family=Lato:wght@400;500;600&display=swap'
          rel='stylesheet'
          media='print'
          onLoad="this.media='all'"
        />
      </Head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src='https://www.googletagmanager.com/ns.html?id=GTM-KWC622ZJ'
            height='0'
            width='0'
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
