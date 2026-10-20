// pages/api/rss.js (served at /rss.xml)
// RSS 2.0 feed of the latest articles with their full text, for feed
// readers, aggregators and AI tools that follow feeds.

import db from "../../utils/db";
import News from "../../models/News";
import {
  SITE_NAME,
  SITE_URL,
  escapeXml,
  newsPlainText,
  newsUrl,
  truncateText,
} from "../../utils/seo";

const IMAGE_MARKER = /\[(https?:\/\/[^\s\]]+)\]/;

// Article body as simple HTML, following the same markup rules as the
// article page: "#" starts a subheading, "[https://…]" places an image
function articleHtml(content) {
  return (content || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const image = line.match(IMAGE_MARKER);
      if (image) {
        const text = line.replace(IMAGE_MARKER, "").trim();
        return (
          `<p><img src="${escapeXml(image[1])}" alt="" /></p>` +
          (text ? `<p>${escapeXml(text)}</p>` : "")
        );
      }
      if (line.startsWith("#")) {
        return `<h2>${escapeXml(line.replace(/^#+/, "").trim())}</h2>`;
      }
      return `<p>${escapeXml(line)}</p>`;
    })
    .join("");
}

export default async function handler(req, res) {
  try {
    await db.connect(true);

    const newsItems = await News.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("title slug content author category tags imageUrl createdAt")
      .lean();

    const itemsXml = newsItems
      .filter((item) => item.slug)
      .map((item) => {
        const link = newsUrl(item.slug);
        const categories = [item.category, ...(item.tags || [])]
          .filter(Boolean)
          .map((name) => `<category>${escapeXml(name)}</category>`)
          .join("");

        return (
          "<item>" +
          `<title>${escapeXml(item.title)}</title>` +
          `<link>${escapeXml(link)}</link>` +
          `<guid isPermaLink="true">${escapeXml(link)}</guid>` +
          `<pubDate>${new Date(item.createdAt || Date.now()).toUTCString()}</pubDate>` +
          `<dc:creator>${escapeXml(item.author || SITE_NAME)}</dc:creator>` +
          categories +
          `<description>${escapeXml(truncateText(newsPlainText(item.content), 300))}</description>` +
          `<content:encoded>${escapeXml(articleHtml(item.content))}</content:encoded>` +
          (item.imageUrl ?
            `<media:content url="${escapeXml(item.imageUrl)}" medium="image" />`
          : "") +
          "</item>"
        );
      })
      .join("");

    const lastBuild =
      newsItems[0]?.createdAt ? new Date(newsItems[0].createdAt) : new Date();

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">` +
      "<channel>" +
      `<title>${escapeXml(SITE_NAME)} News</title>` +
      `<link>${SITE_URL}/news</link>` +
      `<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />` +
      "<description>Healthcare and surgical industry news, FDA alerts and product updates from STAT Surgical Supply.</description>" +
      "<language>en-us</language>" +
      `<lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>` +
      "<image>" +
      `<url>${SITE_URL}/images/assets/logo.png</url>` +
      `<title>${escapeXml(SITE_NAME)} News</title>` +
      `<link>${SITE_URL}/news</link>` +
      "</image>" +
      itemsXml +
      "</channel>" +
      "</rss>";

    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=900, stale-while-revalidate=3600",
    );
    return res.status(200).send(xml);
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return res.status(503).send("Feed temporarily unavailable");
  }
}
