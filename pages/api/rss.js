import { Feed } from "rss";
import db from "../../utils/db";
import News from "../../models/News";

export default async function handler(req, res) {
  await db.connect(true);

  const siteUrl = "https://statusurgicalsupply.com";
  const feed = new Feed({
    title: "Status Surgical Supply News",
    description: "Latest news from Status Surgical Supply",
    id: siteUrl,
    link: siteUrl,
    language: "en",
    favicon: `${siteUrl}/favicon.ico`,
    updated: new Date(),
  });

  const newsItems = await News.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  newsItems.forEach((item) => {
    feed.addItem({
      title: item.title,
      id: `${siteUrl}/news/${item.slug}`,
      link: `${siteUrl}/news/${item.slug}`,
      description: item.content,
      date: item.createdAt,
      author: [{ name: item.author }],
    });
  });

  res.setHeader("Content-Type", "application/rss+xml");
  res.status(200).send(feed.rss2());
}
