import { describe, expect, test } from "vitest";
import { buildLlmsFullTxt, buildLlmsTxt } from "./llmsTxt";
import { generalFaqs, supportFaqs } from "./faqData";

const products = [
  {
    name: "EGIA45AVM",
    manufacturer: "Medtronic",
    each: { description: "Endo GIA reload", wpPrice: 120, customerPrice: 88 },
  },
  {
    name: "PSD45",
    manufacturer: " medtronic ",
    box: { description: "Box of 6", wpPrice: 0, customerPrice: 300 },
  },
  { name: "CDH29A", manufacturer: "Ethicon", information: "Circular stapler" },
];

const news = [
  {
    title: "FDA recall notice",
    slug: "fda-recall-notice",
    content: "[https://res.cloudinary.com/demo/a.jpg] Intro paragraph.",
  },
];

describe("buildLlmsTxt", () => {
  const text = buildLlmsTxt({ products, news });

  test("follows the llms.txt layout", () => {
    expect(text.startsWith("# STAT Surgical Supply\n\n> ")).toBe(true);
    expect(text).toContain("## Shop");
    expect(text).toContain(
      "- [Full product list](https://www.statsurgicalsupply.com/llms-full.txt)",
    );
  });

  test("counts manufacturers the way the catalog groups them", () => {
    expect(text).toContain("3 products from 2 manufacturers");
  });

  test("lists news with plain-text excerpts", () => {
    expect(text).toContain(
      "- [FDA recall notice](https://www.statsurgicalsupply.com/news/fda-recall-notice): Intro paragraph.",
    );
  });
});

describe("buildLlmsFullTxt", () => {
  const text = buildLlmsFullTxt({
    products,
    news,
    generatedAt: new Date("2026-10-20T00:00:00Z"),
  });

  test("lists every product with its canonical link and public price only", () => {
    expect(text).toContain(
      "- [EGIA45AVM](https://www.statsurgicalsupply.com/products/EGIA45AVM): Endo GIA reload Web price: $120.00 per unit.",
    );
    expect(text).toContain(
      "- [PSD45](https://www.statsurgicalsupply.com/products/PSD45): Box of 6 Price on request.",
    );
    expect(text).not.toContain("$88");
    expect(text).not.toContain("$300");
  });

  test("includes every FAQ answer", () => {
    for (const faq of [...generalFaqs, ...supportFaqs]) {
      expect(text).toContain(faq.answer);
    }
  });
});
