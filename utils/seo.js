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
    brand: product.manufacturer,
    description: product.description || '',
    sku: product.slug || '',
    mpn: product.slug || '',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.countInStock > 0 ||
        product.countInStockBulk > 0 ||
        product.countInStockClearance > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `https://www.statsurgicalsupply.com/products/${product.slug}`,

      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnReasonCategory: 'RETURN_REASON_CATEGORY_UNSPECIFIED',
        applicableCountry: {
          '@type': 'Country',
          name: 'US',
        },
      },

      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: '0.00',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          businessDays: 'https://schema.org/BusinessDay',
          cutoffTime: '12:00',
          transitTime: 'https://schema.org/1BusinessDay',
          handlingTime: 'https://schema.org/1BusinessDay',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US',
        },
      },
    },
    applicableCountry: 'US',
  };
}

export { generateJSONLD, generateProductJSONLD };
