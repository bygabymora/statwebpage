// pages/api/rss.js

import db from "../../utils/db";
import News from "../../models/News";

export default async function handler(req, res) {
  try {
    await db.connect(true);

    const siteUrl = "https://www.statsurgicalsupply.com";

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const newsItems = await News.find({ createdAt: { $gte: twoDaysAgo } })
      .sort({ createdAt: -1 })
      .lean();

    const itemsXml = newsItems
      .map((item) => {
        const pubDate = new Date(item.createdAt || Date.now()).toISOString();
        const title = escapeXml(item.title);
        const description = escapeXml(
          (item.summary || item.content || "").slice(0, 300)
        );
        const information = escapeXml(item.information || "");
        const author = escapeXml(item.author || "Stat Surgical Supply");
        const slug = item.slug;
        const keywords = escapeXml(
          item.keywords?.join(", ") || "surgical supplies, healthcare, USA"
        );

        return `
        <item>
          <title>${title}</title>
          <link>${siteUrl}/news/${slug}</link>
          <guid isPermaLink="true">${siteUrl}/news/${slug}</guid>
          <description>${description}</description>
          <information>${information}</information>
          <pubDate>${pubDate}</pubDate>
          <author>${author}</author>
          <news:news>
            <news:publication>
              <news:name>Stat Surgical Supply News</news:name>
              <news:language>en</news:language>
            </news:publication>
            <news:genres>PressRelease</news:genres>
          <news:access>Public</news:access>
            <news:publication_date>${pubDate}</news:publication_date>
            <news:title>${title}</news:title>
          <news:keywords>${keywords}</news:keywords>
          </news:news>
        </item>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
     version="2.0">
  <channel>
    <title>Stat Surgical Supply News</title>
    <link>${siteUrl}</link>
    <description>Latest news from Stat Surgical Supply</description>
    <language>en</language>
    ${itemsXml}
  </channel>
</rss>`;

    res.setHeader("Content-Type", "application/rss+xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Error generating Google News RSS:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

// Escapes characters that can break XML
function escapeXml(unsafe) {
  return unsafe
    ?.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
