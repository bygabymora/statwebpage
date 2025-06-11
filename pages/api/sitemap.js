// pages/api/sitemap.js
import db from "../../utils/db";
import News from "../../models/News";
import Product from "../../models/Product";

const BASE_URL = "https://www.statsurgicalsupply.com";

export default async function handler(req, res) {
  try {
    await db.connect(true);

    // Fetch only the fields we need, and use .lean()
    const newsArticles = await News.find().select("slug").lean();
    const products = await Product.find()
      .select("manufacturer name _id")
      .lean();

    // Build each <url> element, ensuring no leading/trailing whitespace
    const urls = [
      ...newsArticles.map(({ slug }) => {
        const loc = `${BASE_URL}/news/${encodeURIComponent(slug)}`;
        return `<url><loc>${loc}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`;
      }),
      ...products.map(({ manufacturer, name, _id }) => {
        const loc = `${BASE_URL}/products/${encodeURIComponent(
          manufacturer
        )}-${encodeURIComponent(name)}?pId=${_id}`;
        return `<url><loc>${loc}</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>`;
      }),
    ].join("");

    // Emit a single, compact XML document
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(xml);
  } catch (err) {
    console.error("Error generating sitemap:", err);
    // Return a 200 with minimal valid XML so that Google won’t block the whole thing,
    // or return 500 if you prefer to force a retry.
    const empty = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(empty);
  }
}
