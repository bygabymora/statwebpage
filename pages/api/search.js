import db from "../../utils/db";
import Product from "../../models/Product";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await db.connect();

    const keywordRaw = req.query.keyword?.trim();
    const limit = parseInt(req.query.limit) || 20;

    let products = [];
    // If keywordRaw is provided, check for an exact lookup by _id.
    if (keywordRaw) {
      if (mongoose.Types.ObjectId.isValid(keywordRaw)) {
        const product = await Product.findById(keywordRaw);
        if (product) {
          const obj = product.toObject();
          obj.collection = "products";
          // Return immediately with this one product.
          return res.status(200).json([obj]);
        }
      }
      // Otherwise, search using a regex.
      const keyword = keywordRaw.replace(/\s+/g, " ").trim();
      const regex = new RegExp(keyword.split(" ").join(".*"), "i");

      // Step 1: Exact match on the product name.
      products = await Product.find({
        name: { $regex: new RegExp(`^${keyword}$`, "i") },
      }).limit(limit);

      // Step 2: If no exact match, search in name, manufacturer, slug, or GTIN fields.
      if (products.length === 0) {
        products = await Product.find({
          $or: [
            { name: { $regex: regex } },
            { manufacturer: { $regex: regex } },
            { slug: { $regex: regex } },
            { "each.gtin": { $regex: regex } },
            { "box.gtin": { $regex: regex } },
          ],
          active: true,
        }).limit(limit);
      }
    } else {
      products = await Product.find({ active: true }).limit(limit);
    }

    products.sort((a, b) => {
      const aInStock =
        (a.each?.quickBooksQuantityOnHandProduction || 0) > 0 ||
        (a.box?.quickBooksQuantityOnHandProduction || 0) > 0;
      const bInStock =
        (b.each?.quickBooksQuantityOnHandProduction || 0) > 0 ||
        (b.box?.quickBooksQuantityOnHandProduction || 0) > 0;
      if (aInStock && !bInStock) return -1;
      if (!aInStock && bInStock) return 1;

      const aHasPrice = (a.each?.wpPrice || 0) > 0 || (a.box?.wpPrice || 0) > 0;
      const bHasPrice = (b.each?.wpPrice || 0) > 0 || (b.box?.wpPrice || 0) > 0;
      if (aHasPrice && !bHasPrice) return -1;
      if (!aHasPrice && bHasPrice) return 1;

      return a.name.localeCompare(b.name);
    });

    await db.disconnect();
    res.status(200).json(products);
  } catch (error) {
    await db.disconnect();
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
