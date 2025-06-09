// pages/sitemap.xml.js
import db from "../utils/db";
import News from "../models/News";
import Product from "../models/Product";

const BASE_URL = "https://www.statsurgicalsupply.com";

export default async function handler(req, res) {
  // 1) Connect to Mongo
  await db.connect(true);

  // 2) Fetch slugs and IDs
  const newsArticles = await News.find().select("slug").lean();
  const products = await Product.find().select("manufacturer name _id").lean();

  // 3) Build XML
  //    We use encodeURI to escape spaces or other special chars in <loc>.
  const urls = [
    ...newsArticles.map(({ slug }) => {
      const loc = encodeURI(`${BASE_URL}/news/${slug}`);
      return `
  <url>
    <loc>${loc}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    }),
    ...products.map(({ manufacturer, name, _id }) => {
      const loc = encodeURI(
        `${BASE_URL}/products/${manufacturer}-${name}?pId=${_id}`
      );
      return `
  <url>
    <loc>${loc}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }),
  ].join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  // 4) Send it with the correct header
  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(sitemap);
}
