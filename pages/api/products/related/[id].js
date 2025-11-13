// pages/api/products/related/[id].js

import db from "../../../../utils/db";
import Product from "../../../../models/Product";

const handler = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    // Use the cached connection system
    await db.connect();

    // First, get the current product to find its manufacturer
    const currentProduct = await Product.findById(id).lean();
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Escape special regex characters in manufacturer name
    const escapedManufacturer = currentProduct.manufacturer.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // Find products from the same manufacturer, excluding the current product
    // Only include products that have stock (either each or box countInStock > 0)
    const relatedProducts = await Product.find({
      manufacturer: { $regex: new RegExp(`^${escapedManufacturer}$`, "i") },
      _id: { $ne: id }, // Exclude current product
      $or: [
        { "each.countInStock": { $exists: true, $gt: 0 } },
        { "box.countInStock": { $exists: true, $gt: 0 } },
      ],
    })
      .select(
        "name manufacturer image each box clearance keywords information sentOverNight"
      )
      .limit(5) // Get up to 5 products
      .lean(); // Use lean() for better performance

    return res.status(200).json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
  // Don't manually disconnect - let the connection pool handle it
};

export default handler;
