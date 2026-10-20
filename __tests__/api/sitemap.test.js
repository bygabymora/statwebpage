import { beforeEach, describe, expect, test, vi } from "vitest";
import { createMocks } from "node-mocks-http";
import sitemapHandler from "../../pages/api/sitemap";
import rssHandler from "../../pages/api/rss";
import db from "../../utils/db";
import Product from "../../models/Product";
import News from "../../models/News";

vi.mock("../../utils/db", () => ({
  default: { connect: vi.fn(), disconnect: vi.fn() },
}));
vi.mock("../../models/Product", () => ({ default: { find: vi.fn() } }));
vi.mock("../../models/News", () => ({ default: { find: vi.fn() } }));

// Chainable stand-in for a mongoose query
function query(result) {
  const q = {
    select: () => q,
    sort: () => q,
    limit: () => q,
    lean: () => Promise.resolve(result),
  };
  return q;
}

const products = [
  {
    name: "EGIA45AVM",
    manufacturer: "Medtronic",
    image: "https://res.cloudinary.com/demo/egia.jpg?a=1&b=2",
    updatedAt: new Date("2026-10-01T00:00:00Z"),
  },
  // Same name from another manufacturer resolves to the same page
  { name: "EGIA45AVM", manufacturer: "Covidien" },
  { name: "ABC 10/20", manufacturer: "Ethicon", updatedAt: "not a date" },
];

const news = [
  {
    title: "Recall: R&D update <draft>",
    slug: "recall-update",
    content: "#Summary\nFirst paragraph.\n[https://res.cloudinary.com/demo/n.jpg]",
    author: "Jane Doe",
    category: "FDA",
    tags: ["recall"],
    imageUrl: "https://res.cloudinary.com/demo/n.jpg",
    createdAt: new Date("2026-10-19T10:00:00Z"),
  },
];

describe("/api/sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Product.find.mockReturnValue(query(products));
    News.find.mockReturnValue(query(news));
  });

  test("lists only catalog products, once each, under their canonical URL", async () => {
    const { req, res } = createMocks({ method: "GET" });
    await sitemapHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(Product.find).toHaveBeenCalledWith({ approved: true, active: true });

    const xml = res._getData();
    const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

    expect(locs).toContain("https://www.statsurgicalsupply.com/");
    expect(locs).toContain("https://www.statsurgicalsupply.com/faqs");
    expect(locs).toContain("https://www.statsurgicalsupply.com/news/recall-update");
    expect(locs).toContain(
      "https://www.statsurgicalsupply.com/products/ABC%2010%2F20",
    );
    expect(
      locs.filter((loc) => loc.endsWith("/products/EGIA45AVM")),
    ).toHaveLength(1);
    // No manufacturer-name duplicate URLs
    expect(xml).not.toContain("Medtronic-EGIA45AVM");
    expect(locs).toEqual([...new Set(locs)]);
  });

  test("escapes image URLs and skips invalid dates", async () => {
    const { req, res } = createMocks({ method: "GET" });
    await sitemapHandler(req, res);

    const xml = res._getData();
    expect(xml).toContain("egia.jpg?a=1&amp;b=2");
    expect(xml).toContain("<lastmod>2026-10-01T00:00:00.000Z</lastmod>");
    expect(xml).not.toContain("Invalid Date");
  });

  test("returns 503 instead of an empty sitemap when the database fails", async () => {
    db.connect.mockRejectedValueOnce(new Error("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { req, res } = createMocks({ method: "GET" });
    await sitemapHandler(req, res);

    expect(res._getStatusCode()).toBe(503);
  });
});

describe("/api/rss", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    News.find.mockReturnValue(query(news));
  });

  test("produces RSS 2.0 items with escaped text and full content", async () => {
    const { req, res } = createMocks({ method: "GET" });
    await rssHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const xml = res._getData();

    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<title>Recall: R&amp;D update &lt;draft&gt;</title>");
    expect(xml).toContain("<pubDate>Mon, 19 Oct 2026 10:00:00 GMT</pubDate>");
    expect(xml).toContain("<dc:creator>Jane Doe</dc:creator>");
    expect(xml).toContain("&lt;h2&gt;Summary&lt;/h2&gt;");
    // Elements that are not part of RSS 2.0 are gone
    expect(xml).not.toContain("<information>");
    expect(xml).not.toContain("<news:news>");
  });
});
