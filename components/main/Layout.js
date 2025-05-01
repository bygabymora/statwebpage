import Head from "next/head";
import React, { useEffect } from "react";
import Header from "./Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Footer";
import { generateJSONLD, generateProductJSONLD } from "../../utils/seo";
import Logo from "../../public/images/assets/logo2.png";
import { signOut, useSession } from "next-auth/react";
import { useModalContext } from "../context/ModalContext";
import { useRouter } from "next/router";

export default function Layout({
  children,
  title,
  product,
  news,
  canonical,
  description,
}) {
  const { data: session } = useSession();
  const { showStatusMessage, openAlertModal } = useModalContext();
  const router = useRouter();

  const approvalMessage = {
    title: "Account Verification",
    body: "Thank you for trusting us and considering our services. We will work to approve your account within 24 hours.",
    warning:
      "If it takes longer than expected, please contact us for more information. Thank you for choosing us!",
  };

  const disabledMessage = {
    title: "Account Disabled",
    body: "Your account has been disabled. Please contact support for more information.",
    warning:
      "If you believe this is an error, please reach out to customer service immediately.",
  };

  const redirectHandler = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  useEffect(() => {
    if (!session?.user) return;

    const { approved, active } = session.user;

    if (approved === false) {
      showStatusMessage("error", approvalMessage.body);
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

  return (
    <div className='w-full' lang='en-US'>
      <Head>
        <title>
          {" "}
          {title
            ? `${title} | Stat Surgical Supply`
            : "Stat Surgical Supply"}{" "}
        </title>
        <meta
          name='description'
          content={
            description
              ? description
              : product
              ? product.description?.slice(0, 160)
              : "Buy surgical supplies online at affordable prices. Quality medical products for your needs."
          }
        />
        <link rel='icon' href='/favicon.ico' />
        <link
          rel='canonical'
          href={
            canonical
              ? canonical
              : product
              ? `https://www.statsurgicalsupply.com/products/${product.manufacturer}-${product.name}-${product._id}`
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
          property='og:description'
          content={
            product
              ? product.description?.slice(0, 200)
              : "Buy surgical supplies online at affordable prices."
          }
        />
        <meta property='og:image' content={product?.image || Logo} />
        <meta
          property='og:url'
          content={canonical || "https://www.statsurgicalsupply.com/"}
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
              __html: JSON.stringify(generateProductJSONLD(product)),
            }}
          />
        )}
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
      <ToastContainer position='bottom-center' limit={1} />
      <div className='flex min-h-screen flex-col justify-between'>
        <Header />
        <main className='main container m-auto mt-11 px-4 min-h-[30vh]'>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
