// Builds /llms.txt and /llms-full.txt: Markdown guides to the site for AI
// assistants and agents (https://llmstxt.org). Facts come from utils/seo.js
// and utils/faqData.js so they say what the pages say; when a policy changes,
// update it there and on its page.
import {
  BUSINESS,
  SITE_NAME,
  SITE_URL,
  newsPlainText,
  newsUrl,
  productUrl,
  publicWebPrice,
  truncateText,
} from "./seo";
import { generalFaqs, supportFaqs } from "./faqData";

const { address } = BUSINESS;
const ADDRESS_LINE = `${address.streetAddress}, ${address.addressLocality}, ${address.addressRegion} ${address.postalCode}`;

const SUMMARY = `> ${SITE_NAME} (${BUSINESS.legalName}) is a surgical supply distributor based in Tampa, Florida. It sells brand-name surgical supplies and disposables, in original manufacturer packaging, to hospitals, surgery centers and clinics across the United States, by the box or as single units.`;

// Groups products the way the catalog's manufacturer filter does
// (case-insensitive), largest manufacturers first
function groupByManufacturer(products) {
  const groups = new Map();
  for (const product of products) {
    if (!product.name) continue;
    const label = product.manufacturer?.trim() || "Other";
    const key = label.toLowerCase();
    if (!groups.has(key)) groups.set(key, { name: label, products: [] });
    groups.get(key).products.push(product);
  }
  return [...groups.values()].sort(
    (a, b) =>
      b.products.length - a.products.length || a.name.localeCompare(b.name),
  );
}

function keyFacts(products) {
  const groups = groupByManufacturer(products);
  const count = groups.reduce((sum, group) => sum + group.products.length, 0);
  const leading = groups
    .slice(0, 10)
    .map((group) => group.name)
    .join(", ");

  return [
    "Key facts:",
    "",
    "- Customers: hospitals, surgery centers, clinics and other healthcare facilities in the United States; more than 150 facilities served.",
    `- Catalog: ${count} products from ${groups.length} manufacturers${leading ? `, including ${leading}` : ""}.`,
    "- Savings: out-of-contract purchasing and urgent backup supply when a primary distributor cannot fill an order, with savings of up to 50%.",
    "- Product condition: original manufacturer packaging; long-dated stock, typically 1 to 3+ years until expiration. Short-dated products are only sent with the customer's approval.",
    "- Pricing and ordering: public web prices are shown on product pages when available. Registered, approved accounts see availability, order online and can get custom pricing; new accounts are reviewed within 24 hours.",
    "- Payment: purchase orders from domestic hospitals and surgery centers; ACH, wire transfer, domestic credit card or PayPal for other approved customers.",
    "- Shipping: primarily within the continental United States, by FedEx or UPS, with same-day shipping on in-stock items ordered before 2 PM Eastern on business days. Nothing ships on weekends. Temperature-sensitive items should ship overnight.",
    `- Returns: within 14 days of purchase, for store credit only. Items must be new and unused with manufacturer seals intact, and the buyer pays return shipping. Email ${BUSINESS.salesEmail} for a return authorization (RMA) number first. Integra DuraSeal, Integra DuraGen and Medtronic bone grafts can't be returned (temperature and humidity sensitive).`,
    `- Contact: phone ${BUSINESS.telephone}, email ${BUSINESS.salesEmail}; office at ${ADDRESS_LINE}; ${BUSINESS.hours}.`,
  ].join("\n");
}

function newsLines(news) {
  return news
    .filter((article) => article.slug && article.title)
    .map(
      (article) =>
        `- [${linkText(article.title)}](${newsUrl(article.slug)}): ${truncateText(newsPlainText(article.content), 160)}`,
    );
}

function linkText(text) {
  return String(text).replace(/[[\]]/g, (char) => `\\${char}`);
}

function priceText(product) {
  const webPrice = publicWebPrice(product);
  return webPrice ?
      `Web price: $${webPrice.price.toFixed(2)} per ${webPrice.unit.toLowerCase()}.`
    : "Price on request.";
}

export function buildLlmsTxt({ products, news }) {
  return [
    `# ${SITE_NAME}`,
    "",
    SUMMARY,
    "",
    keyFacts(products),
    "",
    "## Shop",
    "",
    `- [Product catalog](${SITE_URL}/products): every product, filterable by manufacturer`,
    `- [Full product list](${SITE_URL}/llms-full.txt): every product with its link, description and web price, plus the FAQs, as plain text`,
    `- [Create an account](${SITE_URL}/Register): needed to see availability, order online and get custom pricing`,
    "",
    "## Company",
    "",
    `- [About](${SITE_URL}/about): who ${SITE_NAME} is and how it works`,
    `- [Guaranteed savings](${SITE_URL}/savings): out-of-contract purchasing and backup supply for hospitals and surgery centers`,
    `- [Secure buying and selling](${SITE_URL}/selling): buying from and selling to ${SITE_NAME}`,
    `- [Manufacturer form](${SITE_URL}/ManufacturerForm): send product details to get a quote`,
    `- [Support and contact](${SITE_URL}/support): phone, email, office location and support FAQs`,
    `- [FAQs](${SITE_URL}/faqs): ordering, sterility, expiration dates, shipping and payment`,
    "",
    "## Policies",
    "",
    `- [Return policy](${SITE_URL}/return-policy)`,
    `- [Terms of use](${SITE_URL}/terms-of-use)`,
    `- [Privacy policy](${SITE_URL}/privacy-policy)`,
    "",
    "## Latest news",
    "",
    ...newsLines(news),
    "",
    "## Optional",
    "",
    `- [All news](${SITE_URL}/news): healthcare and surgical industry news, FDA alerts and recalls`,
    `- [Video news](${SITE_URL}/news/video)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    `- [News RSS feed](${SITE_URL}/rss.xml)`,
    "",
  ].join("\n");
}

export function buildLlmsFullTxt({ products, news, generatedAt = new Date() }) {
  const catalog = groupByManufacturer(products).flatMap((group) => [
    `### ${group.name} (${group.products.length} ${group.products.length === 1 ? "product" : "products"})`,
    "",
    ...group.products
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((product) => {
        const description = [
          product.each?.description || product.box?.description,
          truncateText(product.information, 300),
        ]
          .map((text) => (text || "").replace(/\s+/g, " ").trim())
          .filter(Boolean)
          .join(" ");
        return `- [${linkText(product.name)}](${productUrl(product.name)}): ${description ? `${description} ` : ""}${priceText(product)}`;
      }),
    "",
  ]);

  const faqs = [...generalFaqs, ...supportFaqs].flatMap((faq) => [
    `### ${faq.question}`,
    "",
    faq.answer,
    "",
  ]);

  return [
    `# ${SITE_NAME}: full product list`,
    "",
    SUMMARY,
    "",
    keyFacts(products),
    "",
    `Generated ${generatedAt.toISOString()}. Web prices are in US dollars and match the public price on each product page; approved accounts may get custom pricing. Stock changes during the day, so check the product page or contact sales for availability. A shorter overview is at ${SITE_URL}/llms.txt.`,
    "",
    "## Products by manufacturer",
    "",
    ...catalog,
    "## Frequently asked questions",
    "",
    ...faqs,
    "## Latest news",
    "",
    ...newsLines(news),
    "",
  ].join("\n");
}
