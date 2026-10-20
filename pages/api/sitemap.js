// pages/api/sitemap.js (served at /sitemap.xml)
import db from "../../utils/db";
import News from "../../models/News";
import Product from "../../models/Product";
import { SITE_URL, escapeXml, newsUrl, productUrl } from "../../utils/seo";

// Public pages worth indexing. Private and utility pages are noindex and
// stay out (see isNoindexRoute in utils/seo.js).
const STATIC_PATHS = [
  "/",
  "/products",
  "/news",
  "/news/video",
  "/about",
  "/faqs",
  "/support",
  "/savings",
  "/selling",
  "/ManufacturerForm",
  "/Register",
  "/return-policy",
  "/privacy-policy",
  "/terms-of-use",
];

function urlEntry({ loc, lastmod, image }) {
  const date = lastmod ? new Date(lastmod) : null;
  const hasDate = date && !isNaN(date);
  const hasImage = typeof image === "string" && image.startsWith("http");

  return (
    "<url>" +
    `<loc>${escapeXml(loc)}</loc>` +
    (hasDate ? `<lastmod>${date.toISOString()}</lastmod>` : "") +
    (hasImage ?
      `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`
    : "") +
    "</url>"
  );
}

export default async function handler(req, res) {
  try {
    await db.connect(true);

    const [products, newsArticles] = await Promise.all([
      // Same filter as the public catalog
      Product.find({ approved: true, active: true })
        .select("name image updatedAt")
        .lean(),
      News.find().select("slug imageUrl updatedAt createdAt").lean(),
    ]);

    // One entry per canonical URL: the product page links by name only
    const productEntries = new Map();
    for (const product of products) {
      if (!product.name) continue;
      const loc = productUrl(product.name);
      if (!productEntries.has(loc)) {
        productEntries.set(
          loc,
          urlEntry({ loc, lastmod: product.updatedAt, image: product.image }),
        );
      }
    }

    const entries = [
      ...STATIC_PATHS.map((path) => urlEntry({ loc: `${SITE_URL}${path}` })),
      ...productEntries.values(),
      ...newsArticles
        .filter((article) => article.slug)
        .map((article) =>
          urlEntry({
            loc: newsUrl(article.slug),
            lastmod: article.updatedAt || article.createdAt,
            image: article.imageUrl,
          }),
        ),
    ];

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">` +
      entries.join("") +
      `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    return res.status(200).send(xml);
  } catch (err) {
    console.error("Error generating sitemap:", err);
    // A 5xx makes crawlers retry later; an empty sitemap would tell them
    // the site has no pages
    return res.status(503).send("Sitemap temporarily unavailable");
  }
}
