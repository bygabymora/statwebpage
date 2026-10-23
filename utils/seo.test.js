import { describe, expect, test } from "vitest";
import {
  canonicalPath,
  generateJSONLD,
  generateProductJSONLD,
  isNoindexRoute,
  jsonLd,
  newsPlainText,
  productPath,
  productUrl,
  truncateText,
} from "./seo";

const baseProduct = {
  name: "EGIA45AVM",
  manufacturer: "Medtronic",
  image: "https://res.cloudinary.com/demo/egia.jpg",
  each: { description: "Endo GIA reload", countInStock: 5, wpPrice: 120 },
  box: { countInStock: 0, wpPrice: 600 },
};

describe("product URLs", () => {
  test("encode names so they resolve to a single page", () => {
    expect(productPath("ABC 10/20#3")).toBe("/products/ABC%2010%2F20%233");
    expect(productUrl("EGIA45AVM")).toBe(
      "https://www.statsurgicalsupply.com/products/EGIA45AVM",
    );
  });
});

describe("generateProductJSONLD", () => {
  test("advertises the public web price with the real return policy", () => {
    const schema = generateProductJSONLD(baseProduct);

    expect(schema.url).toBe(productUrl("EGIA45AVM"));
    expect(schema.offers.price).toBe("120.00");
    expect(schema.offers.availability).toBe("https://schema.org/InStock");
    expect(schema.offers.hasMerchantReturnPolicy).toMatchObject({
      merchantReturnDays: 14,
      refundType: "https://schema.org/StoreCreditRefund",
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    });
    // Shipping is billed per order, so no flat "free shipping" claim
    expect(schema.offers.shippingDetails).toBeUndefined();
  });

  test("never exposes customer pricing and omits the offer without a web price", () => {
    const schema = generateProductJSONLD({
      ...baseProduct,
      each: { countInStock: 5, wpPrice: 0, customerPrice: 99 },
      box: { wpPrice: 0, customerPrice: 450 },
    });

    expect(schema.offers).toBeUndefined();
    expect(JSON.stringify(schema)).not.toContain("99");
  });

  test("uses the box web price when there is no each price, like the page", () => {
    const schema = generateProductJSONLD({
      ...baseProduct,
      each: { countInStock: 0, wpPrice: 0 },
      box: { countInStock: 2, wpPrice: 600 },
    });
    expect(schema.offers.price).toBe("600.00");
  });
  test("uses the box web price when only the box is in stock, even if each still has a price", () => {
    const schema = generateProductJSONLD({
      ...baseProduct,
      each: { countInStock: 0, wpPrice: 120 },
      box: { countInStock: 2, wpPrice: 600 },
    });
    expect(schema.offers.price).toBe("600.00");
  });

  test("counts held units as unavailable", () => {
    const schema = generateProductJSONLD({
      ...baseProduct,
      each: { countInStock: 3, heldStock: 3, wpPrice: 120 },
      box: { countInStock: 1, heldStock: 1, wpPrice: 600 },
    });
    expect(schema.offers.availability).toBe("https://schema.org/OutOfStock");
  });

  test("includes only well-formed GTINs", () => {
    expect(generateProductJSONLD({ ...baseProduct, gtin: "00643169007222" }).gtin).toBe(
      "00643169007222",
    );
    expect(generateProductJSONLD({ ...baseProduct, gtin: "N/A" }).gtin).toBeUndefined();
  });
});

describe("news helpers", () => {
  const article = {
    title: "FDA recall notice",
    slug: "fda-recall-notice",
    content:
      "[https://res.cloudinary.com/demo/a.jpg] Intro paragraph.\n#Details\nBody text.",
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "not a date",
  };

  test("plain text drops image markers and heading marks", () => {
    expect(newsPlainText(article.content)).toBe(
      "Intro paragraph. Details Body text.",
    );
  });

  test("article schema uses the plain text and skips invalid dates", () => {
    const schema = generateJSONLD(article);
    expect(schema.articleBody).toBe("Intro paragraph. Details Body text.");
    expect(schema.datePublished).toBe("2026-10-01T12:00:00.000Z");
    expect(schema).not.toHaveProperty("dateModified");
  });

  test("video schema has no NaN duration when the length is unknown", () => {
    const [, video] = generateJSONLD({
      ...article,
      hasVideo: true,
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=abc123",
    });
    expect(video.embedUrl).toBe("https://www.youtube.com/embed/abc123");
    expect(video).not.toHaveProperty("duration");
    expect(video).not.toHaveProperty("contentUrl");
  });
});

describe("truncateText", () => {
  test("cuts at a word boundary and leaves short text alone", () => {
    expect(truncateText("short text", 20)).toBe("short text");
    expect(truncateText("one two three four five", 15)).toBe("one two...");
  });
});

describe("jsonLd", () => {
  test("cannot close the surrounding script tag", () => {
    expect(jsonLd({ description: "</script><b>" })).not.toContain("</script>");
  });
});

describe("isNoindexRoute", () => {
  test("covers private, transactional and admin pages only", () => {
    expect(isNoindexRoute("/cart")).toBe(true);
    expect(isNoindexRoute("/order/[id]")).toBe(true);
    expect(isNoindexRoute("/admin/products")).toBe(true);
    expect(isNoindexRoute("/products/[id]")).toBe(false);
    expect(isNoindexRoute("/")).toBe(false);
  });
});

describe("canonicalPath", () => {
  test("points rewritten aliases at the page's own route", () => {
    expect(canonicalPath("/Login", "/login?redirect=%2Fcart")).toBe("/Login");
    expect(canonicalPath("/ManufacturerForm", "/manufacturerform")).toBe(
      "/ManufacturerForm",
    );
  });

  test("keeps the requested path on dynamic routes", () => {
    expect(canonicalPath("/news/[slug]", "/news/q3-update?utm=x#top")).toBe(
      "/news/q3-update",
    );
  });
});
