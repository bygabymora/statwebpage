import Product from "../../../models/Product";
import db from "../../../utils/db";

const handler = async (req, res) => {
  try {
    await db.connect();
  } catch {
    return res
      .status(503)
      .json({ message: "Service unavailable: Database connection failed" });
  }

  if (req.method === "GET") {
    return getHandler(req, res);
  } else {
    return res.status(400).send({ message: "Method not allowed" });
  }
};

const getHandler = async (req, res) => {
  try {
    let products = await Product.find({ approved: true, active: true }).lean();

    // Custom sort priority
    products.sort((a, b) => {
      const aInStock =
        (a.each?.quickBooksQuantityOnHandProduction || 0) > 0 ||
        (a.box?.quickBooksQuantityOnHandProduction || 0) > 0;

      const bInStock =
        (b.each?.quickBooksQuantityOnHandProduction || 0) > 0 ||
        (b.box?.quickBooksQuantityOnHandProduction || 0) > 0;

      const aHasPrice = (a.each?.wpPrice || 0) > 0 || (a.box?.wpPrice || 0) > 0;

      const bHasPrice = (b.each?.wpPrice || 0) > 0 || (b.box?.wpPrice || 0) > 0;

      // Priority by: stock first, then by price
      if (aInStock && !bInStock) return -1;
      if (!aInStock && bInStock) return 1;

      if (aHasPrice && !bHasPrice) return -1;
      if (!aHasPrice && bHasPrice) return 1;

      return a.name.localeCompare(b.name); // fallback alphabetical
    });

    res.send(products);
  } catch (error) {
    console.error("Product fetch error:", error);
    res.status(500).send({ message: "Error fetching products" });
  }
};

export default handler;
