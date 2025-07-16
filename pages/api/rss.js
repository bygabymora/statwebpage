import RSS from "rss";
import db from "../../utils/db";
import News from "../../models/News";

export default async function handler(req, res) {
  try {
    await db.connect(true);

    const siteUrl = "https://www.statsurgicalsupply.com";
    const feed = new RSS({
      title: "Stat Surgical Supply News",
      description: "Latest news from Stat Surgical Supply",
      feed_url: `${siteUrl}/api/rss`,
      site_url: siteUrl,
      language: "en",
      pubDate: new Date(),
    });

    const newsItems = await News.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    newsItems.forEach((item) => {
      feed.item({
        title: item.title,
        url: `${siteUrl}/news/${item.slug}`,
        description: item.content,
        date: item.createdAt || new Date(),
        author: item.author,
      });
    });

    res.setHeader("Content-Type", "application/rss+xml");
    res.status(200).send(feed.xml({ indent: true }));
  } catch (error) {
    console.error("❌ Error generating RSS:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
}
