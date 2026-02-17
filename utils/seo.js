function generateJSONLD(news) {
  const isValidDate = (value) => {
    const date = new Date(value);
    return value && !isNaN(date);
  };

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    keywords: news.tags?.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.statsurgicalsupply.com/news/${news.slug}`,
    },
    headline: news.title,
    articleBody: news.content || "",
    image: [news.imageUrl],
    ...(isValidDate(news.createdAt) && {
      datePublished: new Date(news.createdAt).toISOString(),
    }),
    ...(isValidDate(news.updatedAt) && {
      dateModified: new Date(news.updatedAt).toISOString(),
    }),
    author: {
      "@type": "Person",
      name: news.author || "STAT Surgical Supply",
    },
    publisher: {
      "@type": "Organization",
      name: "STAT Surgical Supply",
      logo: {
        "@type": "ImageObject",
        url: "https://www.statsurgicalsupply.com/images/assets/logo.png",
        width: 600,
        height: 60,
      },
    },
    description: news.content?.substring(0, 160) || "",
  };
}

function generateProductJSONLD(product) {
  const canonicalUrl = `https://www.statsurgicalsupply.com/products/${encodeURIComponent(
    product.name,
  )}`;
  const price = (
    product.each?.minSalePrice ||
    product.box?.minSalePrice ||
    product.each?.wprice ||
    product.box?.wprice ||
    product.each?.customerPrice ||
    product.box?.customerPrice ||
    0
  ).toFixed(2);

  const keywords =
    Array.isArray(product.keywords) ? product.keywords.join(", ") : undefined;

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    ...(keywords ? { keywords } : {}),
    name: `${product.name}`,
    image: [product.image],
    brand: {
      "@type": "Brand",
      name: product.manufacturer,
    },
    description: product?.each?.description || product?.box?.description || "",
    // information: product?.information || "", // NOT a valid Product property → removed
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
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        applicableCountry: "US",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        refundType: "https://schema.org/FullRefund",
        returnFees: "https://schema.org/FreeReturn",
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
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
      },
    },
  };
}

function generateMainPageJSONLD() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    inLanguage: "en-US",
    url: "https://www.statsurgicalsupply.com",
    name: "STAT Surgical Supply",
    description:
      "STAT Surgical Supply provides premium surgical equipment for clinics and hospitals. Save thousands on high-quality supplies with us.",
    publisher: {
      "@type": "Organization",
      name: "STAT Surgical Supply",
      url: "https://www.statsurgicalsupply.com",
    },
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://www.statsurgicalsupply.com/products?query={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

// Organization Schema for company information
function generateOrganizationJSONLD() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.statsurgicalsupply.com/#organization",
    name: "STAT Surgical Supply",
    legalName: "STAT Surgical Supply LLC",
    url: "https://www.statsurgicalsupply.com",
    logo: {
      "@type": "ImageObject",
      url: "https://www.statsurgicalsupply.com/images/assets/logo.png",
      width: 600,
      height: 60,
    },
    description:
      "Leading provider of premium surgical supplies serving healthcare facilities nationwide with cost-effective solutions.",
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
      addressCountry: "US",
      addressRegion: "United States",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["English"],
        areaServed: "US",
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        availableLanguage: ["English"],
        areaServed: "US",
      },
    ],
    sameAs: ["https://www.statsurgicalsupply.com"],
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
    "@id": "https://www.statsurgicalsupply.com/about",
    name: "About STAT Surgical Supply",
    description:
      "Learn about STAT Surgical Supply's mission to provide premium surgical supplies to healthcare professionals nationwide.",
    url: "https://www.statsurgicalsupply.com/about",
    mainEntity: {
      "@id": "https://www.statsurgicalsupply.com/#organization",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.statsurgicalsupply.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "About Us",
          item: "https://www.statsurgicalsupply.com/about",
        },
      ],
    },
  };
}

// Contact Page Schema
function generateContactPageJSONLD() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": "https://www.statsurgicalsupply.com/contact",
    name: "Contact STAT Surgical Supply",
    description:
      "Get in touch with our surgical supply experts for quotes, product information, and personalized healthcare solutions.",
    url: "https://www.statsurgicalsupply.com/contact",
    mainEntity: {
      "@id": "https://www.statsurgicalsupply.com/#organization",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.statsurgicalsupply.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Contact",
          item: "https://www.statsurgicalsupply.com/contact",
        },
      ],
    },
  };
}

// Products Page Collection Schema
function generateProductsPageJSONLD(
  products = [],
  currentPage = 1,
  totalProducts = 0,
) {
  const baseUrl = "https://www.statsurgicalsupply.com/products";
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
        url: `https://www.statsurgicalsupply.com/products/${encodeURIComponent(
          product.name,
        )}`,
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.statsurgicalsupply.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: "https://www.statsurgicalsupply.com/products",
        },
      ],
    },
  };
}

// Service Pages Schema (Support, Savings, etc.)
function generateServicePageJSONLD(pageName, pageSlug, serviceDescription) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://www.statsurgicalsupply.com/${pageSlug}`,
    name: `${pageName} - STAT Surgical Supply`,
    description: serviceDescription,
    url: `https://www.statsurgicalsupply.com/${pageSlug}`,
    isPartOf: {
      "@type": "WebSite",
      "@id": "https://www.statsurgicalsupply.com",
    },
    about: {
      "@type": "Service",
      name: pageName,
      description: serviceDescription,
      provider: {
        "@id": "https://www.statsurgicalsupply.com/#organization",
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.statsurgicalsupply.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: pageName,
          item: `https://www.statsurgicalsupply.com/${pageSlug}`,
        },
      ],
    },
  };
}

// News/Blog listing page schema
function generateNewsPageJSONLD(articles = []) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://www.statsurgicalsupply.com/news",
    name: "Surgical News & Healthcare Insights",
    description:
      "Stay updated with the latest news and insights in healthcare, surgical technology.",
    url: "https://www.statsurgicalsupply.com/news",
    publisher: {
      "@id": "https://www.statsurgicalsupply.com/#organization",
    },
    blogPost: articles.slice(0, 10).map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      description: article.content?.substring(0, 160) || "",
      url: `https://www.statsurgicalsupply.com/news/${article.slug}`,
      datePublished: article.createdAt,
      dateModified: article.updatedAt || article.createdAt,
      author: {
        "@type": "Person",
        name: article.author || "STAT Surgical Supply",
      },
      image: article.imageUrl,
    })),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.statsurgicalsupply.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "News",
          item: "https://www.statsurgicalsupply.com/news",
        },
      ],
    },
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

// Local Business Schema (if you have physical location)
function generateLocalBusinessJSONLD() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": "https://www.statsurgicalsupply.com/#localbusiness",
    name: "STAT Surgical Supply",
    description:
      "Leading supplier of surgical supplies serving healthcare facilities nationwide.",
    url: "https://www.statsurgicalsupply.com",
    telephone: "+1-813-252-0727",
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
      addressRegion: "United States",
    },
    // geo removed until real coordinates are available (lat/long are required if you include geo)
    openingHours: "Mo-Fr 09:00-17:00",
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    serviceArea: {
      "@type": "Country",
      name: "United States",
    },
  };
}

export {
  generateJSONLD,
  generateProductJSONLD,
  generateMainPageJSONLD,
  generateOrganizationJSONLD,
  generateAboutPageJSONLD,
  generateContactPageJSONLD,
  generateProductsPageJSONLD,
  generateServicePageJSONLD,
  generateNewsPageJSONLD,
  generateBreadcrumbJSONLD,
  generateLocalBusinessJSONLD,
};
