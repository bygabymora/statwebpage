const SITE = "https://www.statsurgicalsupply.com";

function toAbsoluteUrl(url) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function isValidDate(value) {
  const d = new Date(value);
  return value && !isNaN(d);
}

function generateJSONLD(news) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    ...(Array.isArray(news.tags) && news.tags.length
      ? { keywords: news.tags.join(", ") }
      : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE}/news/${news.slug}`,
    },
    headline: news.title,
    articleBody: news.content || "",
    image: news.imageUrl ? [toAbsoluteUrl(news.imageUrl)] : undefined,
    ...(isValidDate(news.createdAt) && {
      datePublished: new Date(news.createdAt).toISOString(),
    }),
    ...(isValidDate(news.updatedAt) && {
      dateModified: new Date(news.updatedAt).toISOString(),
    }),
    author: { "@type": "Person", name: news.author || "STAT Surgical Supply" },
    publisher: {
      "@type": "Organization",
      name: "STAT Surgical Supply",
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteUrl("/images/assets/logo.png"),
        width: 600,
        height: 60,
      },
    },
    description: (news.content || "").substring(0, 160),
  };
}

function generateProductJSONLD(product) {
  // Preferimos el SKU real; si tu modelo guarda el SKU en _id, está bien.
  const sku = String(product.sku || product._id || "").trim();
  const canonicalUrl = `${SITE}/products/${encodeURIComponent(sku)}`;

  // Imagen(es) absolutas
  const images = []
    .concat(product.image || [])
    .concat(product.images || [])
    .filter(Boolean)
    .map(toAbsoluteUrl);

  // Descripción corta segura
  const description = (
    product.each?.description ||
    product.box?.description ||
    product.description ||
    ""
  )
    .toString()
    .slice(0, 500);

  // Marca
  const brandName = product.manufacturer || product.brand || "Unknown";

  // Precio: solo si EXISTE un precio público > 0. De lo contrario, omite offers.
  const priceCandidate =
    product?.each?.minSalePrice ??
    product?.box?.minSalePrice ??
    product?.each?.wprice ??
    product?.box?.wprice ??
    product?.each?.customerPrice ??
    product?.box?.customerPrice;

  const hasPrice = typeof priceCandidate === "number" && priceCandidate > 0;

  // Propiedades extra (opcional)
  const additionalProperty = [];
  if (product.size)
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Size",
      value: String(product.size),
    });
  if (product.side)
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Side",
      value: String(product.side),
    });
  if (product.material)
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Material",
      value: String(product.material),
    });
  if (product.uom)
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Units per package",
      value: String(product.uom),
    });

  const json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${brandName} ${product.name || sku} ${sku}`.trim(),
    sku,
    mpn: sku, // si tienes un MPN distinto, cámbialo aquí
    model: sku,
    brand: { "@type": "Brand", name: brandName },
    description,
    ...(images.length ? { image: images } : {}),
    url: canonicalUrl,
    category: product.category || "Surgical Supplies",
    ...(additionalProperty.length ? { additionalProperty } : {}),
  };

  // Solo añade offers si muestras precio real en la página
  if (hasPrice) {
    json.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: Number(priceCandidate).toFixed(2),
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
      seller: { "@type": "Organization", name: "STAT Surgical Supply" },
    };
  }

  // IMPORTANTÍSIMO: NO incluir aggregateRating/review si no están en la página y no son reales
  return json;
}

function generateMainPageJSONLD() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    inLanguage: "en-US",
    url: SITE,
    name: "STAT Surgical Supply",
    description:
      "STAT Surgical Supply provides premium surgical equipment for clinics and hospitals. Save thousands on high-quality medical devices with us.",
    publisher: {
      "@type": "Organization",
      name: "STAT Surgical Supply",
      url: SITE,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE}/products?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export { generateJSONLD, generateProductJSONLD, generateMainPageJSONLD };
