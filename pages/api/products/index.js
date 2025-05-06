import { getToken } from "next-auth/jwt";
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
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    await db.connect();

    const sortDirection = req.query.sort === "asc" ? 1 : -1;
    let sortField = "name";
    if (sortDirection === -1) {
      sortField = `-${sortField}`;
    }

    // Conditional logic based on token
    let filter = { approved: true, active: true };

    if (token?.protectedInventory === true) {
      // Restricted user: do not show protected products
      filter.protected = false;
    }

    const products = await Product.find(filter)
      .sort({ [sortField]: sortDirection })
      .lean();

    res.send(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ message: "Error fetching products" });
  }
};

export default handler;
