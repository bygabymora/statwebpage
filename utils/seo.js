function generateJSONLD(news) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.statsurgicalsupply.com/news/${news.slug}`,
    },
    headline: news.title,
    image: [news.imageUrl],
    datePublished: news.createdAt,
    dateModified: news.updatedAt,
    author: {
      '@type': 'Person',
      name: news.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'STAT Surgical Supply',
      logo: {
        '@type': 'ImageObject',
        url: '../public/images/assets/logo.png',
      },
    },
    description: news.content.substring(0, 160),
  };
}

function generateProductJSONLD(product) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description || '',
    sku: product.slug || '',
    mpn: product.slug || '',
    brand: {
      '@type': 'Thing',
      name: product.manufacturer,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: `https://www.statsurgicalsupply.com/products/${product.slug}`,
    },
  };
}

export { generateJSONLD, generateProductJSONLD };