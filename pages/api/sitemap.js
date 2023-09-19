import db from '../../utils/db';
import News from '../../models/News';
import Product from '../../models/Product';

const BASE_URL = 'https://www.statsurgicalsupply.com';

export default async function sitemap(req, res) {
  await db.connect();

  // Fetch news article slugs
  const newsArticles = await News.find({}).select('slug');

  // Fetch product slugs
  const products = await Product.find({}).select('slug');

  await db.disconnect();

  // Create the XML sitemap format
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

      ${newsArticles
        .map(
          (news) => `
          <url>
            <loc>${BASE_URL}/news/${news.slug}</loc>
            <changefreq>daily</changefreq>
            <priority>0.7</priority>
          </url>
        `
        )
        .join('')}
      ${products
        .map(
          (product) => `
          <url>
            <loc>${BASE_URL}/products/${product.slug}</loc>
            <changefreq>daily</changefreq>
            <priority>0.9</priority>
          </url>
        `
        )
        .join('')}
    </urlset>
  `;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
}
