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

export default function Layout({ children, title, product, news }) {
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

  function generateProductJSONLD(product) {
    const canonicalUrl = `https://www.statsurgicalsupply.com/products/${product.manufacturer}-${product.name}?pId=${product._id}`;
    const price = (product.each?.wpPrice || product.box?.wpPrice || 0).toFixed(
      2
    );
    console.log("Generating JSON-LD for product:", product.image);

    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: `${product.name}`,
      image: [product.image],
      brand: {
        "@type": "Brand",
        name: product.manufacturer,
      },
      description: product.each.description || "",
      sku: product._id,
      mpn: product._id,
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: price,
        itemCondition: "https://schema.org/NewCondition",
        availability: "https://schema.org/InStock",
        url: canonicalUrl,
        seller: {
          "@type": "Organization",
          name: "STAT Surgical Supply",
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          returnReasonCategory: "RETURN_REASON_CATEGORY_UNSPECIFIED",
          applicableCountry: {
            "@type": "Country",
            name: "US",
          },
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            currency: "USD",
            value: "0.00",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            businessDays: "https://schema.org/BusinessDay",
            cutoffTime: "12:00",
            transitTime: "https://schema.org/1BusinessDay",
            handlingTime: "https://schema.org/1BusinessDay",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "US",
          },
        },
      },
      applicableCountry: "US",
    };
  }

  function generateJSONLD(news) {
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://www.statsurgicalsupply.com/news/${news.slug}`,
      },
      headline: news.title,
      image: [news.imageUrl],
      datePublished: news.createdAt,
      dateModified: news.updatedAt,
      author: {
        "@type": "Person",
        name: news.author,
      },
      publisher: {
        "@type": "Organization",
        name: "STAT Surgical Supply",
        logo: {
          "@type": "ImageObject",
          url: "https://www.statsurgicalsupply.com/images/assets/logo.png",
        },
      },
      description: news.content.substring(0, 160),
    };
  }

  return (
    <div className='w-full' lang='en-US'>
      <Head>
        <title>
          {title ? `${title} | Stat Surgical Supply` : "Stat Surgical Supply"}
        </title>
        <meta
          name='description'
          content={
            product
              ? product.description?.slice(0, 160)
              : "Buy surgical supplies online at affordable prices. Quality medical products for your needs."
          }
        />
        <link rel='icon' href='/favicon.ico' />
        <link
          rel='canonical'
          href={
            product
              ? `https://www.statsurgicalsupply.com/products/${product.manufacturer}-${product.name}?pId=${product._id}`
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
          content={
            product
              ? `https://www.statsurgicalsupply.com/products/${product.manufacturer}-${product.name}?pId=${product._id}`
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
        <main className='main m-auto mt-[11rem] max-w-[1400px] px-4 pt-10 min-h-[30vh] w-full'>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
