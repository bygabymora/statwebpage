// pages/api/llms.js (served at /llms.txt)
import db from "../../utils/db";
import News from "../../models/News";
import Product from "../../models/Product";
import { buildLlmsTxt } from "../../utils/llmsTxt";

export default async function handler(req, res) {
  try {
    await db.connect(true);

    const [products, news] = await Promise.all([
      // Same filter as the public catalog
      Product.find({ approved: true, active: true })
        .select("name manufacturer")
        .lean(),
      News.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title slug content")
        .lean(),
    ]);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    return res.status(200).send(buildLlmsTxt({ products, news }));
  } catch (err) {
    console.error("Error generating llms.txt:", err);
    return res.status(503).send("Temporarily unavailable");
  }
}
