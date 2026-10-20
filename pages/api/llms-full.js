// pages/api/llms-full.js (served at /llms-full.txt)
import db from "../../utils/db";
import News from "../../models/News";
import Product from "../../models/Product";
import { buildLlmsFullTxt } from "../../utils/llmsTxt";

export default async function handler(req, res) {
  try {
    await db.connect(true);

    const [products, news] = await Promise.all([
      // Same filter as the public catalog; only fields visitors can see
      Product.find({ approved: true, active: true })
        .select(
          "name manufacturer information each.description box.description each.wpPrice box.wpPrice",
        )
        .lean(),
      News.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select("title slug content")
        .lean(),
    ]);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    return res.status(200).send(buildLlmsFullTxt({ products, news }));
  } catch (err) {
    console.error("Error generating llms-full.txt:", err);
    return res.status(503).send("Temporarily unavailable");
  }
}
