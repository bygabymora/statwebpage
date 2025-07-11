import Head from "next/head";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Footer";
import Logo from "../../public/images/assets/logo2.png";
import { signOut, useSession } from "next-auth/react";
import { useModalContext } from "../context/ModalContext";
import { useRouter } from "next/router";
import { generateJSONLD, generateProductJSONLD } from "../../utils/seo";
import Script from "next/script";
export default function Layout({ children, title, product, news, schema }) {
  const { data: session } = useSession();
  const { showStatusMessage, openAlertModal } = useModalContext();
  const [approvalPending, setApprovalPending] = useState(false);
  const router = useRouter();
  console.log("product In Layout", product);

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
        <meta
          name='description'
          content={
            product
              ? product.each?.description?.slice(0, 160)
              : "Buy surgical supplies online at affordable prices. Fast shipping, secure checkout, and excellent customer support. Perfect for clinics, hospitals, and outpatient centers."
          }
        />
        <meta
          name='keywords'
          content={
            product?.keywords && Array.isArray(product.keywords)
              ? product.keywords.join(", ")
              : ""
          }
        />
        <meta name='robots' content='index, follow' />
        <link rel='icon' href='/favicon.ico' />
        <link
          rel='canonical'
          href={
            product
              ? `https://www.statsurgicalsupply.com/products/${product.name}`
              : "https://www.statsurgicalsupply.com/"
          }
        />
        <meta property='og:type' content={product ? "product" : "website"} />
        <meta
          property='og:title'
          content={
            product
              ? `${product.manufacturer} - ${product.name}`
              : "Stat Surgical Supply"
          }
        />
        <meta
          name='description'
          content={
            product
              ? product.each?.description?.slice(0, 200)
              : "Buy surgical supplies online at affordable prices. Fast shipping, secure checkout, and excellent customer support. Perfect for clinics, hospitals, and outpatient centers."
          }
        />
        <meta property='og:image' content={product?.image || Logo} />
        <meta
          property='og:url'
          content={
            product
              ? `https://www.statsurgicalsupply.com/products/${product.name}`
              : "https://www.statsurgicalsupply.com/"
          }
        />
        <meta name='twitter:card' content='summary_large_image' />
        <meta
          name='twitter:title'
          content={
            product
              ? `${product.manufacturer} - ${product.name}`
              : "Stat Surgical Supply"
          }
        />
        <meta
          name='twitter:description'
          content={
            product
              ? product.description?.slice(0, 200)
              : "Buy surgical supplies online at affordable prices."
          }
        />
        <meta name='twitter:image' content={product?.image || Logo} />

        {product && (
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schema || generateProductJSONLD(product)),
            }}
          />
        )}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-11333627655');
            `,
          }}
        ></script>
        {news && (
          <>
            <meta name='description' content={news.content.slice(0, 160)} />
            <meta name='keywords' content={news.tags.join(", ")} />
            <meta property='og:title' content={news.title} />
            <meta
              property='og:description'
              content={news.content.slice(0, 200)}
            />
            <meta property='og:image' content={news.imageUrl} />
            <meta
              property='og:url'
              content={`https://www.statsurgicalsupply.com/news/${news.slug}`}
            />
            <meta property='og:type' content='article' />
            <link
              rel='canonical'
              href={`https://www.statsurgicalsupply.com/news/${news.slug}`}
            />
            <script
              type='application/ld+json'
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(generateJSONLD(news)),
              }}
            />
          </>
        )}
      </Head>
      <Script
        async
        src='https://www.googletagmanager.com/gtag/js?id=AW-11333627655'
      ></Script>
      <ToastContainer position='bottom-center' limit={1} />
      <div className='flex min-h-screen flex-col justify-between'>
        <Header />
        <main className='main m-auto mt-[11rem] max-w-[1400px] px-4 pt-10 min-h-[30vh] w-full'>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
