import db from "../../utils/db";
import Product from "../../models/Product";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import WpUser from "../../models/WpUser";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // 1. Authenticate WP user
  const wpUser = await getToken({ req });
  let wpUserInDB = null;
  if (wpUser) {
    wpUserInDB = await WpUser.findById(wpUser._id).lean();
  }

  try {
    await db.connect(true);

    const keywordRaw = req.query.keyword?.trim();
    const limit = parseInt(req.query.limit, 10) || 20;

    let products = [];

    if (keywordRaw) {
      // 2. Exact ID lookup
      if (mongoose.Types.ObjectId.isValid(keywordRaw)) {
        const product = await Product.findById(keywordRaw).lean();
        if (product) {
          product.collection = "products";

          return res.status(200).json([product]);
        }
      }

      // 3. Regex name search
      const keyword = keywordRaw.replace(/\s+/g, " ").trim();
      const exactNameMatch = await Product.find({
        name: { $regex: new RegExp(`^${keyword}$`, "i") },
      })
        .limit(limit)
        .lean();

      if (exactNameMatch.length) {
        products = exactNameMatch;
      } else {
        const regex = new RegExp(keyword.split(" ").join(".*"), "i");
        products = await Product.find({
          $or: [
            { name: regex },
            { manufacturer: regex },
            { slug: regex },
            { "each.gtin": regex },
            { "box.gtin": regex },
          ],
        })
          .limit(limit)
          .lean();
      }
    } else {
      // 4. No keyword → grab all
      products = await Product.find({}).limit(limit).lean();
    }

    // 5. Sort in‐stock / priced / name
    products.sort((a, b) => {
      const aInStock =
        (a.each?.countInStock || 0) > 0 || (a.box?.countInStock || 0) > 0;
      const bInStock =
        (b.each?.countInStock || 0) > 0 || (b.box?.countInStock || 0) > 0;
      if (aInStock !== bInStock) return aInStock ? -1 : 1;

      const aHasPrice = (a.each?.wpPrice || 0) > 0 || (a.box?.wpPrice || 0) > 0;
      const bHasPrice = (b.each?.wpPrice || 0) > 0 || (b.box?.wpPrice || 0) > 0;
      if (aHasPrice !== bHasPrice) return aHasPrice ? -1 : 1;

      return a.name.localeCompare(b.name);
    });

    // 6. If restricted, zero‐out quantities on *protected* products only
    let updatedProducts = products;
    if (wpUserInDB?.restricted) {
      updatedProducts = products.map((product) => {
        if (!product.protected) {
          return product; // leave unprotected items unchanged
        }
        return {
          ...product,
          each: product.each
            ? {
                ...product.each,
                countInStock: 0,
              }
            : undefined,
          box: product.box
            ? {
                ...product.box,
                countInStock: 0,
              }
            : undefined,
        };
      });
    }

    return res.status(200).json(updatedProducts);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
