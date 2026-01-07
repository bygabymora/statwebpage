// pages/api/sitemap-news.js
import db from "../../utils/db";
import News from "../../models/News";

const BASE_URL = "https://www.statsurgicalsupply.com";

export default async function handler(req, res) {
  try {
    await db.connect(true);

    // Google News only accepts news from the last 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const news = await News.find({
      createdAt: { $gte: twoDaysAgo },
    })
      .sort({ createdAt: -1 })
      .lean();

    const urls = news
      .map((item) => {
        const url = `${BASE_URL}/news/${item.slug}`;
        const pubDate = new Date(item.createdAt).toISOString();

        return `
  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>Stat Surgical Supply</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${item.title}]]></news:title>
    </news:news>
  </url>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Error generating Google News sitemap:", error);
    res.status(500).end();
  }
}
