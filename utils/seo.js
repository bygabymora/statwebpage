export const SITE_URL = "https://www.statsurgicalsupply.com";
export const SITE_NAME = "STAT Surgical Supply";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const LOGO = {
  "@type": "ImageObject",
  url: `${SITE_URL}/images/assets/logo.png`,
  width: 500,
  height: 500,
};

// Share image for pages that have none of their own: logo + products at the
// 1200x630 size link previews use
export const DEFAULT_SHARE_IMAGE = {
  url: `${SITE_URL}/images/assets/share-card.jpg`,
  width: 1200,
  height: 630,
};

// Company facts used by the structured data and /llms.txt. Keep them in step
// with the contact section, support page and policy pages.
export const BUSINESS = {
  legalName: "STAT Surgical Supply LLC",
  telephone: "+1-813-252-0727",
  salesEmail: "sales@statsurgicalsupply.com",
  supportEmail: "centralsales@statsurgicalsupply.com",
  address: {
    streetAddress: "100 South Ashley Drive, Suite 600",
    addressLocality: "Tampa",
    addressRegion: "FL",
    postalCode: "33602",
    addressCountry: "US",
  },
  hours: "Monday to Friday, 8 AM to 5 PM Eastern",
  sameAs: [
    "https://www.linkedin.com/company/statsurgicalsupply",
    "https://www.facebook.com/statsurgicalsupply",
  ],
};

// Mirrors pages/return-policy.js: returns within 14 days, store credit only,
// buyer pays return shipping. Google compares this with the policy page, so
// change both together.
const RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "US",
  returnPolicyCountry: "US",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
  refundType: "https://schema.org/StoreCreditRefund",
};

const PUBLISHER = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: LOGO,
};

// Private, transactional and placeholder pages kept out of search results and
// AI answers. Pages behind `Component.auth` are also covered in _app.js.
const NOINDEX_ROUTES = new Set([
  "/404",
  "/authenticateCode",
  "/cart",
  "/order-history",
  "/order/[id]",
  "/payment",
  "/profile",
  "/recoverAccess",
  "/search",
  "/tracking",
  "/unauthorized",
  "/unsubscribe",
]);

export function isNoindexRoute(pathname) {
  return NOINDEX_ROUTES.has(pathname) || pathname.startsWith("/admin");
}

// Product pages are addressed by name. Encoding keeps names that contain
// "/", "#", "?" or "%" pointing at the right page.
export function productPath(name) {
  return `/products/${encodeURIComponent(name)}`;
}

export function productUrl(name) {
  return `${SITE_URL}${productPath(name)}`;
}

export function newsUrl(slug) {
  return `${SITE_URL}/news/${encodeURIComponent(slug)}`;
}

// Same filter as the public catalog: only these products are listed,
// put in the sitemap and offered to search engines.
export function isPubliclyListed(product) {
  return product?.approved === true && product?.active === true;
}

// News bodies mark inline images as "[https://…]" and subheadings with a
// leading "#"; strip both so descriptions and feeds read as plain prose.
export function newsPlainText(content) {
  return (content || "")
    .replace(/\[(https?:\/\/[^\s\]]+)\]/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Shortens at a word boundary so snippets don't end mid-word
export function truncateText(text, max) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 3);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace >= cut.length / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`;
}

// The price logged-out visitors see on the product page ("Web price"). It is
// the only price structured data may advertise: customer pricing stays private.
export function publicWebPrice(product) {
  const eachPrice = Number(product?.each?.wpPrice) || 0;
  const boxPrice = Number(product?.box?.wpPrice) || 0;
  if (eachPrice > 0) return { price: eachPrice, unit: "Unit" };
  if (boxPrice > 0) return { price: boxPrice, unit: "Box" };
  return null;
}

// Serializes structured data for a <script> tag; escaping "<" stops text
// such as "</script>" inside a description from ending the tag early.
export function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// For text and attribute values in the sitemaps and the RSS feed
export function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function videoEmbedUrl(news) {
  return news.videoType === "youtube" ?
      news.videoUrl.replace("watch?v=", "embed/")
    : news.videoUrl;
}

function isValidDate(value) {
  return Boolean(value) && !isNaN(new Date(value));
}

function generateJSONLD(news) {
  const url = newsUrl(news.slug);
  const text = newsPlainText(news.content);

  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    url,
    keywords: news.tags?.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: truncateText(news.title, 110),
    articleBody: text,
    image: news.imageUrl ? [news.imageUrl] : undefined,
    ...(isValidDate(news.createdAt) && {
      datePublished: new Date(news.createdAt).toISOString(),
    }),
    ...(isValidDate(news.updatedAt) && {
      dateModified: new Date(news.updatedAt).toISOString(),
    }),
    author: {
      "@type": "Person",
      name: news.author || SITE_NAME,
    },
    publisher: PUBLISHER,
    description: truncateText(text, 160),
    inLanguage: "en-US",
    isAccessibleForFree: true,
  };

  // If the news article has a video, add VideoObject schema
  if (news.hasVideo && news.videoUrl) {
    const videoSchema = generateVideoObjectJSONLD(news);
    return [baseSchema, videoSchema];
  }

  return baseSchema;
}

// Generate VideoObject schema for news articles with videos
function generateVideoObjectJSONLD(news) {
  const isEmbedded = news.videoType === "youtube" || news.videoType === "vimeo";

  const videoObject = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: news.title,
    description: truncateText(newsPlainText(news.content), 160),
    thumbnailUrl: news.imageUrl,
    // contentUrl is for the media file itself; YouTube/Vimeo only give a player
    ...(!isEmbedded && { contentUrl: news.videoUrl }),
    embedUrl: videoEmbedUrl(news),
    ...(isValidDate(news.createdAt) && {
      uploadDate: new Date(news.createdAt).toISOString(),
    }),
    publisher: PUBLISHER,
    author: {
      "@type": "Person",
      name: news.author || SITE_NAME,
    },
    videoQuality: "HD",
    genre: "Health",
    keywords:
      news.tags?.join(", ") ||
      "health news, medical updates, surgical supplies",
    mainEntity: {
      "@type": "NewsArticle",
      "@id": `${newsUrl(news.slug)}#article`,
    },
  };

  // ONLY add duration if valid
  const seconds = Number(news.videoDurationSeconds);
  if (Number.isFinite(seconds) && seconds > 0) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    videoObject.duration = `PT${m}M${s}S`;
  }

  return videoObject;
}

function generateProductJSONLD(product) {
  const url = productUrl(product.name);
  const keywords =
    Array.isArray(product.keywords) ? product.keywords.join(", ") : undefined;

  // Same rule as the product page: held units are not available to sell
  const available = (unit) =>
    Math.max(0, (unit?.countInStock || 0) - (unit?.heldStock || 0));
  const isInStock =
    available(product.each) > 0 ||
    available(product.box) > 0 ||
    (product.loose?.countInStock || 0) > 0 ||
    (product.each?.clearanceCountInStock || 0) > 0 ||
    (product.box?.clearanceCountInStock || 0) > 0;

  // Google only accepts 8, 12, 13 or 14-digit GTINs
  const gtin = [product.gtin, product.each?.gtin, product.box?.gtin]
    .map((value) => String(value || "").trim())
    .find((value) => /^(\d{8}|\d{12,14})$/.test(value));

  const webPrice = publicWebPrice(product);

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    ...(keywords ? { keywords } : {}),
    name: `${product.name}`,
    ...(product.image && { image: [product.image] }),
    brand: {
      "@type": "Brand",
      name: product.manufacturer,
    },
    description:
      product?.each?.description ||
      product?.box?.description ||
      product?.information ||
      "",
    sku: product.name,
    mpn: product.name,
    productID: product.name,
    ...(gtin && { gtin }),
    // Products without a public web price are sold by quote. A $0 offer
    // would show them as free in search results, so they get no offer.
    ...(webPrice && {
      offers: {
        "@type": "Offer",
        url,
        price: webPrice.price.toFixed(2),
        priceCurrency: "USD",
        itemCondition: "https://schema.org/NewCondition",
        availability:
          isInStock ?
            "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
        hasMerchantReturnPolicy: RETURN_POLICY,
      },
    }),
  };
}

function generateMainPageJSONLD() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    inLanguage: "en-US",
    url: SITE_URL,
    name: SITE_NAME,
    description:
      "STAT Surgical Supply provides premium surgical equipment for clinics and hospitals. Save thousands on high-quality supplies with us.",
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

// Organization Schema for company information
function generateOrganizationJSONLD() {
  const weekdayHours = {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "17:00",
  };

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    logo: LOGO,
    image: DEFAULT_SHARE_IMAGE.url,
    description:
      "Leading provider of premium surgical supplies serving healthcare facilities nationwide with cost-effective solutions.",
    email: BUSINESS.salesEmail,
    telephone: BUSINESS.telephone,
    foundingDate: "2020",
    // Use NAICS instead (valid in Schema.org & Google)
    naics: "423450",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: 10,
      maxValue: 50,
    },
    address: {
      "@type": "PostalAddress",
      ...BUSINESS.address,
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: BUSINESS.telephone,
        email: BUSINESS.supportEmail,
        availableLanguage: ["English"],
        areaServed: "US",
        hoursAvailable: weekdayHours,
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: BUSINESS.telephone,
        email: BUSINESS.salesEmail,
        availableLanguage: ["English"],
        areaServed: "US",
        hoursAvailable: weekdayHours,
      },
    ],
    sameAs: BUSINESS.sameAs,
    knowsAbout: [
      "Surgical supplies",
      "Surgical disposables",
      "Medical device procurement",
      "Hospital and surgery center purchasing",
    ],
    hasMerchantReturnPolicy: RETURN_POLICY,
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Shop Surgical Supplies Services",
        description:
          "Comprehensive surgical supply services including equipment sales, bulk pricing, and expert consultation.",
      },
    },
  };
}

// About Page Schema
function generateAboutPageJSONLD() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/about`,
    name: "About STAT Surgical Supply",
    description:
      "Learn about STAT Surgical Supply's mission to provide premium surgical supplies to healthcare professionals nationwide.",
    url: `${SITE_URL}/about`,
    mainEntity: {
      "@id": ORGANIZATION_ID,
    },
    breadcrumb: generateBreadcrumbJSONLD([
      { name: "Home", url: SITE_URL },
      { name: "About Us", url: `${SITE_URL}/about` },
    ]),
  };
}

// Contact Page Schema
function generateContactPageJSONLD() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${SITE_URL}/support`,
    name: "Contact STAT Surgical Supply",
    description:
      "Get in touch with our surgical supply experts for quotes, product information, and personalized healthcare solutions.",
    url: `${SITE_URL}/support`,
    mainEntity: {
      "@id": ORGANIZATION_ID,
    },
    breadcrumb: generateBreadcrumbJSONLD([
      { name: "Home", url: SITE_URL },
      { name: "Support", url: `${SITE_URL}/support` },
    ]),
  };
}

// Products Page Collection Schema
function generateProductsPageJSONLD(
  products = [],
  currentPage = 1,
  totalProducts = 0,
) {
  const baseUrl = `${SITE_URL}/products`;
  const pageUrl = currentPage > 1 ? `${baseUrl}?page=${currentPage}` : baseUrl;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    name: "Surgical Supplies Catalog",
    description:
      "Browse our comprehensive catalog of premium surgical disposables and healthcare equipment from leading manufacturers.",
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      name: "Surgical Products Catalog",
      numberOfItems: totalProducts,
      // IMPORTANT: avoid nested Product here to prevent "Product snippet" errors on listing pages
      itemListElement: products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        position: (currentPage - 1) * 10 + index + 1,
        name: `${product.manufacturer} ${product.name}`,
        url: productUrl(product.name),
      })),
    },
    breadcrumb: generateBreadcrumbJSONLD([
      { name: "Home", url: SITE_URL },
      { name: "Products", url: baseUrl },
    ]),
  };
}

// Service Pages Schema (Support, Savings, etc.)
function generateServicePageJSONLD(pageName, pageSlug, serviceDescription) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/${pageSlug}`,
    name: `${pageName} - STAT Surgical Supply`,
    description: serviceDescription,
    url: `${SITE_URL}/${pageSlug}`,
    isPartOf: {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
    },
    about: {
      "@type": "Service",
      name: pageName,
      description: serviceDescription,
      provider: {
        "@id": ORGANIZATION_ID,
      },
    },
    breadcrumb: generateBreadcrumbJSONLD([
      { name: "Home", url: SITE_URL },
      { name: pageName, url: `${SITE_URL}/${pageSlug}` },
    ]),
  };
}

// News/Blog listing page schema
function generateNewsPageJSONLD(articles = []) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/news`,
    name: "Surgical News & Healthcare Insights",
    description:
      "Stay updated with the latest news and insights in healthcare, surgical technology.",
    url: `${SITE_URL}/news`,
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    blogPost: articles.slice(0, 10).map((article) => ({
      "@type": "BlogPosting",
      headline: truncateText(article.title, 110),
      description: truncateText(
        article.excerpt || newsPlainText(article.content),
        160,
      ),
      url: newsUrl(article.slug),
      datePublished: article.createdAt,
      dateModified: article.updatedAt || article.createdAt,
      author: {
        "@type": "Person",
        name: article.author || SITE_NAME,
      },
      image: article.imageUrl,
    })),
    breadcrumb: generateBreadcrumbJSONLD([
      { name: "Home", url: SITE_URL },
      { name: "News", url: `${SITE_URL}/news` },
    ]),
  };
}

// Generic breadcrumb generator
function generateBreadcrumbJSONLD(breadcrumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.url && { item: crumb.url }),
    })),
  };
}

export {
  generateJSONLD,
  generateVideoObjectJSONLD,
  generateProductJSONLD,
  generateMainPageJSONLD,
  generateOrganizationJSONLD,
  generateAboutPageJSONLD,
  generateContactPageJSONLD,
  generateProductsPageJSONLD,
  generateServicePageJSONLD,
  generateNewsPageJSONLD,
  generateBreadcrumbJSONLD,
};
