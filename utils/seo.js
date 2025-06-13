// utils/seo.js
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

function generateProductJSONLD(product) {
  const canonicalUrl = `https://www.statsurgicalsupply.com/products/${product.name}`;
  const price = (
    product.each?.minSalePrice ||
    product.box?.minSalePrice ||
    product.each?.wprice ||
    product.box?.wprice ||
    product.each?.customerPrice ||
    product.box?.customerPrice ||
    0
  ).toFixed(2);
  console.log("Generating JSON-LD for product:", product.image);

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
    description: product.each.description || product.box.description || "",
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
        merchantReturnDays: 30,
        returnReasonCategory: "RETURN_REASON_CATEGORY_UNSPECIFIED",
        applicableCountry: {
          "@type": "Country",
          name: "US",
        },
        refundType: "https://schema.org/RefundTypeFull",
        returnMethod: "https://schema.org/ReturnAtSeller",
        returnFees: {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: "0.00",
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

function generateMainPageJSONLD() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://www.statsurgicalsupply.com",
    name: "STAT Surgical Supply",
    description:
      "We provide high-quality surgical supplies to meet the needs of healthcare professionals. Partner with us to save thousands on the same devices you purchase direct.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        url: `https://www.statsurgicalsupply.com/products?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export { generateJSONLD, generateProductJSONLD, generateMainPageJSONLD };
