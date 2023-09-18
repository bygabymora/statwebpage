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

export { generateJSONLD };
