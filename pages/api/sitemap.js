// pages/api/sitemap.js
import db from "../../utils/db";
import News from "../../models/News";
import Product from "../../models/Product";

const BASE_URL = "https://www.statsurgicalsupply.com";

export default async function handler(req, res) {
  try {
    await db.connect(true);

    // only slugs for news
    const newsArticles = await News.find().select("slug").lean();

    // manufacturer, name and _id for products
    const products = await Product.find()
      .select("manufacturer name _id")
      .lean();

    // build <url> entries for news
    const newsUrls = newsArticles.map(({ slug }) => {
      const loc = `${BASE_URL}/news/${encodeURIComponent(slug)}`;
      return `<url><loc>${loc}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`;
    });

    const productUrls = products.flatMap(({ manufacturer, name }) => {
      const slug = `${manufacturer}-${name}`;
      const encSlug = encodeURIComponent(slug);
      const encName = encodeURIComponent(name);

      return [
        `<url><loc>${BASE_URL}/products/${encSlug}</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>`,
        `<url><loc>${BASE_URL}/products/${encName}</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>`,
      ];
    });

    const allUrls = [...newsUrls, ...productUrls].join("");

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      allUrls +
      `</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(xml);
  } catch (err) {
    console.error("Error generating sitemap:", err);
    const empty =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(empty);
  }
}
