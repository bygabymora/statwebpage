import Head from "next/head";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Footer";
import { signOut, useSession } from "next-auth/react";
import { useModalContext } from "../context/ModalContext";
import { useRouter } from "next/router";
import { generateJSONLD, generateProductJSONLD } from "../../utils/seo";
import Script from "next/script";

export default function Layout({
  children,
  title,
  product,
  news,
  schema,
  description,
  image,
  url,
}) {
  const { data: session } = useSession();
  const { showStatusMessage, openAlertModal } = useModalContext();
  const [approvalPending, setApprovalPending] = useState(false);
  const router = useRouter();
  const defaultOgImage =
    "https://www.statsurgicalsupply.com/images/assets/StaticBanner.png";

  const approvalMessage = useMemo(
    () => ({
      title: "Account Verification",
      body: "Thank you for trusting us and considering our services. We will work to approve your account within 24 hours.",
      warning:
        "If it takes longer than expected, please contact us for more information. Thank you for choosing us!",
    }),
    []
  );

  const disabledMessage = useMemo(
    () => ({
      title: "Account Disabled",
      body: "Your account has been disabled. Please contact support for more information.",
      warning:
        "If you believe this is an error, please reach out to customer service immediately.",
    }),
    []
  );

  const redirectHandler = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/");
  }, [router]);

  useEffect(() => {
    if (!session?.user) return;

    const { approved, active } = session.user;

    if (approved === false) {
      setApprovalPending(true); // Mark as pending
      showStatusMessage("error", approvalMessage.body, "warning");
      openAlertModal(approvalMessage);
    } else if (active === false) {
      showStatusMessage("error", disabledMessage.body);
      openAlertModal(disabledMessage, async () => {
        await redirectHandler();
      });

      setTimeout(async () => {
        await redirectHandler();
      }, 5000);
    }
  }, [
    session,
    approvalMessage,
    disabledMessage,
    openAlertModal,
    redirectHandler,
    showStatusMessage,
  ]);

  useEffect(() => {
    if (!session?.user) return;

    const { approved } = session.user;

    if (approved === true && approvalPending) {
      setApprovalPending(false);
      showStatusMessage("success", "Your account has been approved.");
    }
  }, [session?.user?.approved]);

  return (
    <div className='w-full' lang='en-US'>
      <Head>
        <title>
          {title
            ? `${title} | Stat Surgical Supply`
            : "Stat Surgical Supply - Quality Surgical Supplies"}
        </title>
        <meta name='robots' content='index, follow' />
        <meta name='author' content='Stat Surgical Supply' />
        <meta name='publisher' content='Stat Surgical Supply' />
        <link rel='icon' href='/favicon.ico' />

        {product ? (
          <>
            <meta
              name='description'
              content={
                product.each?.description?.slice(0, 160) ||
                "Buy surgical supplies online at affordable prices."
              }
            />
            <meta
              name='keywords'
              content={
                Array.isArray(product.keywords)
                  ? product.keywords.join(", ")
                  : "surgical supplies, medical equipment, healthcare products"
              }
            />
            <meta property='og:type' content='product' />
            <meta
              property='og:title'
              content={`${product.manufacturer} - ${product.name}`}
            />
            <meta
              property='og:description'
              content={product.each?.description?.slice(0, 200)}
            />
            <meta
              property='og:image'
              content={product.image || defaultOgImage}
            />
            <meta
              property='og:url'
              content={`https://www.statsurgicalsupply.com/products/${product.name}`}
            />

            <meta name='twitter:card' content='summary_large_image' />
            <meta
              name='twitter:title'
              content={`${product.manufacturer} - ${product.name}`}
            />
            <meta
              name='twitter:description'
              content={product.each?.description?.slice(0, 200)}
            />
            <meta
              name='twitter:image'
              content={product.image || defaultOgImage}
            />

            <link
              rel='canonical'
              href={`https://www.statsurgicalsupply.com/products/${product.name}`}
            />

            <script
              type='application/ld+json'
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                  schema || generateProductJSONLD(product)
                ),
              }}
            />
          </>
        ) : news ? (
          <>
            <meta
              name='description'
              content={
                description ||
                news.content?.slice(0, 160) ||
                "Stay up to date with important news and insights in the medical and healthcare industry. Trusted updates from Stat Surgical Supply."
              }
            />
            <meta
              name='keywords'
              content={
                news.tags?.join(", ") ||
                "medical news, healthcare, health updates, surgery, innovation, patient care, medical technology, hospital news"
              }
            />
            <meta property='og:type' content='article' />
            <meta property='og:title' content={title || news.title} />
            <meta
              property='og:description'
              content={description || news.content?.slice(0, 200)}
            />
            <meta
              property='og:image'
              content={image || news.imageUrl || defaultOgImage}
            />
            <meta
              property='og:url'
              content={
                url || `https://www.statsurgicalsupply.com/news/${news.slug}`
              }
            />
            {news.createdAt && (
              <meta
                property='article:published_time'
                content={new Date(news.createdAt).toISOString()}
              />
            )}

            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:title' content={title || news.title} />
            <meta
              name='twitter:description'
              content={description || news.content?.slice(0, 200)}
            />
            <meta
              name='twitter:image'
              content={image || news.imageUrl || defaultOgImage}
            />

            <link
              rel='canonical'
              href={
                url || `https://www.statsurgicalsupply.com/news/${news.slug}`
              }
            />

            <script
              type='application/ld+json'
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(generateJSONLD(news)),
              }}
            />
          </>
        ) : (
          <>
            {/* Default (homepage, or fallback) */}
            <meta
              name='description'
              content='High-Quality Surgical Supplies at Unmatched Prices.
                Explore our wide range of high-end surgical disposables. We offer industry-leading brands with cost-saving solutions.'
            />
            <meta
              name='keywords'
              content='surgical supplies, medical equipment, healthcare products'
            />
            <meta property='og:type' content='website' />
            <meta property='og:title' content='Stat Surgical Supply' />
            <meta
              property='og:description'
              content='High-Quality Surgical Supplies at Unmatched Prices.
                Explore our wide range of high-end surgical disposables. We offer industry-leading brands with cost-saving solutions.'
            />
            <meta property='og:image' content={defaultOgImage} />
            <meta
              property='og:url'
              content='https://www.statsurgicalsupply.com/'
            />

            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:title' content='Stat Surgical Supply' />
            <meta
              name='twitter:description'
              content='High-Quality Surgical Supplies at Unmatched Prices.
                Explore our wide range of high-end surgical disposables. We offer industry-leading brands with cost-saving solutions.'
            />
            <meta name='twitter:image' content={defaultOgImage} />

            <link rel='canonical' href='https://www.statsurgicalsupply.com/' />
          </>
        )}
      </Head>

      <Script
        async
        src='https://www.googletagmanager.com/gtag/js?id=AW-11333627655'
      />
      <Script id='gtag-init' strategy='afterInteractive'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-11333627655');
        `}
      </Script>

      <ToastContainer position='bottom-center' limit={1} />
      <div className='flex min-h-screen flex-col justify-between'>
        <Header />
        <main
          className='main m-auto mt-[11rem] max-w-[1400px] px-4 pt-10 min-h-[30vh] w-full'
          key={router.asPath}
        >
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
