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
    product.name
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

  const keywords = Array.isArray(product.keywords)
    ? product.keywords.join(", ")
    : undefined;

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
    information: product?.information || "",
    sku: product._id,
    mpn: product._id,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "5",
    },
    review: [
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "John Doe",
        },
      },
    ],
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

export { generateJSONLD, generateProductJSONLD, generateMainPageJSONLD };
