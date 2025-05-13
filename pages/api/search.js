import db from "../../utils/db";
import Product from "../../models/Product";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await db.connect();

    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { manufacturer: { $regex: req.query.keyword, $options: "i" } },
            { gtin: { $regex: req.query.keyword, $options: "i" } },
            {
              "each.description": { $regex: req.query.keyword, $options: "i" },
            },
            { "box.description": { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    // Fetch and lean for plain JS objects
    let products = await Product.find({ ...keyword }).lean();

    // Sort priority:
    // 1) has any stock (each or box > 0)
    // 2) within those, has any price (each.wpPrice or box.wpPrice > 0)
    // 3) fallback to alphabetical by name
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
