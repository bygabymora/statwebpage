import db from "../../utils/db";
import Product from "../../models/Product";

const handler = async (req, res) => {
  await db.connect(true);

  try {
    const clearanceProducts = await Product.find({
      $or: [
        { "each.clearanceCountInStock": { $gt: 0 } },
        { "box.clearanceCountInStock": { $gt: 0 } },
      ],
    }).lean();

    const hasClearanceProducts = clearanceProducts.length > 0;

    res.status(200).json({ hasClearanceProducts, clearanceProducts }); // Send clearance products
  } catch (error) {
    console.error("Failed to fetch clearance products:", error);
    res.status(500).json({ error: "Failed to fetch clearance products" });
  }
};

export default handler;
