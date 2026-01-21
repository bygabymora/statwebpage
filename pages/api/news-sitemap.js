// pages/api/news-sitemap.js
import db from "../../utils/db";
import News from "../../models/News";

const BASE_URL = "https://www.statsurgicalsupply.com";

export default async function handler(req, res) {
  try {
    await db.connect(true);

    // We fetch only what is necessary
    const newsArticles = await News.find()
      .select("slug updatedAt createdAt")
      .lean();

    const newsUrls = newsArticles
      .filter((item) => item.slug) // for security
      .map(({ slug, updatedAt, createdAt }) => {
        const loc = `${BASE_URL}/news/${encodeURIComponent(slug)}`;
        const lastmodDate = updatedAt || createdAt;
        const lastmod =
          lastmodDate ? new Date(lastmodDate).toISOString() : null;
        return `
  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join("");

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      newsUrls +
      `</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    // optional: cache at the edge/CDN
    // res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");

    return res.status(200).send(xml);
  } catch (err) {
    console.error("Error generating NEWS sitemap:", err);

    const empty =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(empty);
  }
}
