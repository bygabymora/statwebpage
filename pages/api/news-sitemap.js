// pages/api/news-sitemap.js (served at /news-sitemap.xml)
// Google News sitemap. Google only reads articles from the last two days
// here; every article, old or new, is also listed in /sitemap.xml.
import db from "../../utils/db";
import News from "../../models/News";
import { SITE_NAME, escapeXml, newsUrl } from "../../utils/seo";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  try {
    await db.connect(true);

    const recent = await News.find({
      createdAt: { $gte: new Date(Date.now() - TWO_DAYS_MS) },
    })
      .sort({ createdAt: -1 })
      .limit(1000)
      .select("slug title createdAt")
      .lean();

    const newsUrls = recent
      .filter((item) => item.slug) // for security
      .map(
        ({ slug, title, createdAt }) =>
          "<url>" +
          `<loc>${escapeXml(newsUrl(slug))}</loc>` +
          "<news:news>" +
          "<news:publication>" +
          `<news:name>${escapeXml(SITE_NAME)}</news:name>` +
          "<news:language>en</news:language>" +
          "</news:publication>" +
          `<news:publication_date>${new Date(createdAt).toISOString()}</news:publication_date>` +
          `<news:title>${escapeXml(title)}</news:title>` +
          "</news:news>" +
          "</url>",
      )
      .join("");

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">` +
      newsUrls +
      `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=3600",
    );
    return res.status(200).send(xml);
  } catch (err) {
    console.error("Error generating NEWS sitemap:", err);
    return res.status(503).send("News sitemap temporarily unavailable");
  }
}
