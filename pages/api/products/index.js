import Product from "../../../models/Product";
import db from "../../../utils/db";

const handler = async (req, res) => {
  try {
    await db.connect(); // Try to reconnect
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
    const sortDirection = req.query.sort === "asc" ? 1 : -1; // Determine the sort direction from the query parameter

    let sortField = "name";
    if (sortDirection === -1) {
      sortField = `-${sortField}`;
    }
    const products = await Product.find({ approved: true, active: true })
      .sort({ [sortField]: sortDirection })
      .lean();
    console.log("leaked products:", products);
    res.send(products);
  } catch {
    res.status(500).send({ message: "Error fetching products" });
  }
};

export default handler;
