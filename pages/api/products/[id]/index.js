import Product from "../../../../models/Product";
import WpUser from "../../../../models/WpUser";
import db from "../../../../utils/db";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await db.connect(true);
  } catch (err) {
    return res.status(503).json({
      message: "Service unavailable: Database connection failed",
      error: err.message,
    });
  }

  // ── Auth check ───────────────────────────────────────────────
  const token = await getToken({ req });
  const wpUser = token?._id ? await WpUser.findById(token._id).lean() : null;
  const loggedIn = Boolean(token);
  const userApproved = Boolean(wpUser && wpUser.approved);
  const userRestricted = Boolean(userApproved && wpUser.restricted);

  try {
    // ── Determine “rawId” from the URL ───────────────────────────
    const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    let product = null;

    // 1) If it's a valid ObjectId
    if (Types.ObjectId.isValid(rawId)) {
      product = await Product.findById(rawId).lean();
    }

    // 2) If not found, and contains a hyphen, split into [manufacturer, name…]
    if (!product && rawId.includes("-")) {
      const [manufacturer, ...rest] = rawId.split("-");
      const name = rest.join("-");
      product = await Product.findOne({
        manufacturer: { $regex: `^${manufacturer}$`, $options: "i" },
        name: { $regex: `^${name}$`, $options: "i" },
      }).lean();
    }

    // 3) Finally, try matching just “name”
    if (!product) {
      product = await Product.findOne({
        name: { $regex: `^${rawId}$`, $options: "i" },
      }).lean();
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ── Minimal vs Full Response ────────────────────────────────
    if (!loggedIn || !userApproved) {
      const minimal = {
        name: product.name,
        _id: product._id,
        manufacturer: product.manufacturer,
        image: product.image,
        sentOvernight: product.sentOvernight,
        keywords: product.keywords || product.name || [],
        each: {
          description: product.each?.description || null,
          minSalePrice: product.each?.minSalePrice || null,
          wpPrice: product.each?.wpPrice || null,
          customerPrice: product.each?.customerPrice || null,
        },
        box: {
          description: product.box?.description || null,
          minSalePrice: product.box?.minSalePrice || null,
          wpPrice: product.box?.wpPrice || null,
          customerPrice: product.box?.customerPrice || null,
        },
      };
      return res.status(200).json(minimal);
    }

    // Logged in & approved → full info, with “protected” fields zeroed if restricted
    let result = product;
    if (userRestricted && product.protected) {
      result = {
        ...product,
        each: product.each
          ? { ...product.each, quickBooksQuantityOnHandProduction: 0 }
          : product.each,
        box: product.box
          ? { ...product.box, quickBooksQuantityOnHandProduction: 0 }
          : product.box,
      };
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Product fetch error:", error);
    return res.status(500).json({ message: "Error fetching product" });
  }
}
