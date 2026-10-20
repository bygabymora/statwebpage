import Head from "next/head";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useModalContext } from "../context/ModalContext";
import { useRouter } from "next/router";
import {
  DEFAULT_SHARE_IMAGE,
  SITE_NAME,
  SITE_URL,
  canonicalPath,
  generateJSONLD,
  generateProductJSONLD,
  isNoindexRoute,
  jsonLd,
  newsPlainText,
  newsUrl,
  productUrl,
  truncateText,
  videoEmbedUrl,
} from "../../utils/seo";
import Script from "next/script";
import dynamic from "next/dynamic";

// Dynamic imports to reduce initial bundle size
const Header = dynamic(() => import("./Header"), { ssr: true });
const Footer = dynamic(() => import("./Footer"), { ssr: true });
const ToastContainer = dynamic(
  () =>
    import("react-toastify/dist/ReactToastify.css").then(() =>
      import("react-toastify").then((mod) => ({ default: mod.ToastContainer })),
    ),
  { ssr: false },
);

// gtag.js expects the real `arguments` object, not an array.
function gtag() {
  window.dataLayer.push(arguments);
}

function initGoogleAdsTag() {
  window.dataLayer = window.dataLayer || [];
  gtag("js", new Date());
  gtag("config", "AW-11333627655");
}

export default function Layout({
  children,
  title,
  product,
  news,
  schema,
  description,
  image,
  url,
  keywords,
  noindex = false,
}) {
  const { data: session } = useSession();
  const { showStatusMessage, openAlertModal } = useModalContext();
  const [approvalPending, setApprovalPending] = useState(false);
  const router = useRouter();

  const approvalMessage = useMemo(
    () => ({
      title: "Account Verification",
      body: "Thank you for trusting us and considering our services. We will work to approve your account within 24 hours.",
      warning:
        "If it takes longer than expected, please contact us for more information. Thank you for choosing us!",
    }),
    [],
  );

  const disabledMessage = useMemo(
    () => ({
      title: "Account Disabled",
      body: "Your account has been disabled. Please contact support for more information.",
      warning:
        "If you believe this is an error, please reach out to customer service immediately.",
    }),
    [],
  );

  const redirectHandler = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/");
  }, [router]);

  useEffect(() => {
    if (!session?.user) return;

    const { approved, active } = session.user;

    if (approved === false) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setApprovalPending(false);
      showStatusMessage("success", "Your account has been approved.");
    }
  }, [session?.user?.approved]);

  // Memoize expensive product computations
  const productDescription = useMemo(() => {
    if (!product) return null;

    const base = truncateText(
      product.information ||
        product.each?.description ||
        product.box?.description ||
        `${product.manufacturer} ${product.name}`,
      200,
    );
    const manufacturer = product.manufacturer?.toLowerCase() || "";

    const manufacturerDescriptions = {
      medtronic: `${base} - Medtronic surgical supply trusted by 150+ healthcare facilities. Fast shipping, bulk pricing & reliable quality.`,
      intuitive: `${base} - Intuitive surgical solution for hospital-grade performance. Bulk discounts, fast delivery & trusted by surgeons.`,
      stryker: `${base} - Stryker surgical device with unmatched reliability. Designed for hospitals with cost-saving bulk pricing & quick shipping.`,
      ethicon: `${base} - Ethicon surgical supply delivering premium quality. Trusted by healthcare facilities worldwide with fast shipping & bulk discounts.`,
      bard: `${base} - Bard surgical device trusted for performance & safety. Fast delivery, hospital-grade quality & affordable bulk pricing.`,
    };

    const matchingKey = Object.keys(manufacturerDescriptions).find((key) =>
      manufacturer.includes(key),
    );

    return matchingKey ? manufacturerDescriptions[matchingKey] : `${base}`;
  }, [product]);

  const productKeywords = useMemo(() => {
    if (!product) return null;
    // The public product API falls back to the name (a string) when a
    // product has no keyword list
    const productTerms =
      Array.isArray(product.keywords) && product.keywords.length > 0 ?
        product.keywords.join(", ")
      : `${product.name}, ${product.manufacturer}`;

    return `${productTerms}, surgical supplies`;
  }, [product]);

  const hidden = noindex || isNoindexRoute(router.pathname);
  const isVideoNews = Boolean(news?.hasVideo && news?.videoUrl);
  const pageTitle = title || "Stat Surgical Supply | Buy Surgical Supplies";

  const canonicalUrl =
    url ||
    (product ? productUrl(product.name)
    : news?.slug ? newsUrl(news.slug)
    : `${SITE_URL}${canonicalPath(router.pathname, router.asPath)}`);

  const metaDescription =
    description ||
    productDescription ||
    (news ?
      truncateText(newsPlainText(news.content), 160) ||
      "Stay up to date with important news and insights in the surgical and healthcare industry. Trusted updates from Stat Surgical Supply."
    : "Buy healthcare & surgical products at Stat Surgical Supply. Shop Surgical Supplies and disposables with fast shipping and easy returns.");

  const metaKeywords =
    keywords ||
    productKeywords ||
    (news ?
      news.tags?.join(", ") ||
      "surgical news, healthcare, health updates, surgery, innovation, patient care, hospital news"
    : null);

  const ogTitle =
    product ? `${product.manufacturer} - ${product.name}` : pageTitle;
  const ogType =
    product ? "product"
    : isVideoNews ? "video.other"
    : news ? "article"
    : "website";

  // Declare dimensions only for the default image, whose size is known
  const shareImageUrl = image || product?.image || news?.imageUrl;
  const shareImage =
    shareImageUrl ? { url: shareImageUrl } : DEFAULT_SHARE_IMAGE;

  const structuredData = [
    schema ??
      (product ? generateProductJSONLD(product)
      : news ? generateJSONLD(news)
      : null),
  ]
    .flat()
    .filter(Boolean);

  return (
    <div className='w-full' lang='en-US'>
      <Head>
        <title>{pageTitle}</title>
        <meta name='description' content={metaDescription} />
        {metaKeywords && <meta name='keywords' content={metaKeywords} />}
        <meta
          name='robots'
          content={
            hidden ? "noindex, follow" : (
              "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
            )
          }
        />
        <meta name='author' content='Stat Surgical Supply' />
        <meta name='publisher' content='Stat Surgical Supply' />
        <link rel='icon' href='/favicon.ico' />
        {!hidden && <link rel='canonical' href={canonicalUrl} />}

        <meta property='og:site_name' content={SITE_NAME} />
        <meta property='og:locale' content='en_US' />
        <meta property='og:type' content={ogType} />
        <meta property='og:title' content={ogTitle} />
        <meta property='og:description' content={metaDescription} />
        <meta property='og:url' content={canonicalUrl} />
        <meta property='og:image' content={shareImage.url} />
        {shareImage.width && (
          <>
            <meta property='og:image:width' content={shareImage.width} />
            <meta property='og:image:height' content={shareImage.height} />
          </>
        )}

        <meta
          name='twitter:card'
          content={isVideoNews ? "player" : "summary_large_image"}
        />
        <meta name='twitter:title' content={ogTitle} />
        <meta name='twitter:description' content={metaDescription} />
        <meta name='twitter:image' content={shareImage.url} />

        {/* Video-specific meta tags */}
        {isVideoNews && (
          <>
            <meta property='og:video' content={videoEmbedUrl(news)} />
            <meta
              property='og:video:type'
              content={
                news.videoType === "youtube" || news.videoType === "vimeo" ?
                  "text/html"
                : `video/${news.videoType || "mp4"}`
              }
            />
            <meta property='og:video:width' content='1280' />
            <meta property='og:video:height' content='720' />
            <meta name='twitter:player' content={videoEmbedUrl(news)} />
            <meta name='twitter:player:width' content='1280' />
            <meta name='twitter:player:height' content='720' />
          </>
        )}

        {news?.createdAt && (
          <meta
            property='article:published_time'
            content={new Date(news.createdAt).toISOString()}
          />
        )}
        {news?.updatedAt && (
          <meta
            property='article:modified_time'
            content={new Date(news.updatedAt).toISOString()}
          />
        )}

        {structuredData.map((entry, i) => (
          <script
            key={`ld-${i}`}
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: jsonLd(entry) }}
          />
        ))}
      </Head>

      <Script
        src='https://www.googletagmanager.com/gtag/js?id=AW-11333627655'
        strategy='worker'
        onLoad={initGoogleAdsTag}
      />

      {typeof window !== "undefined" && (
        <ToastContainer position='bottom-center' limit={1} />
      )}
      <div className='flex min-h-screen flex-col justify-between'>
        <Header />
        <main
          className='main m-auto mt-0 md:mt-32 lg:mt-48 max-w-350 px-4 pt-3 md:pt-4 lg:pt-6 min-h-[30vh] w-full'
          key={router.asPath}
        >
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
