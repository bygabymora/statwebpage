// pages/api/orders/index.js

import { getToken } from "next-auth/jwt";
import Order from "../../../models/Order";
import db from "../../../utils/db";

export default async function handler(req, res) {
  // 1. Auth
  const user = await getToken({ req });
  if (!user) {
    return res.status(401).send("signin required");
  }

  // 2. Connect to MongoDB
  try {
    await db.connect();
  } catch (error) {
    return res.status(503).json({
      message: "Service unavailable: Database connection failed",
      error,
    });
  }

  try {
    if (req.method === "POST") {
      // 3. Parse orderData
      let orderData = req.body.order;
      if (!orderData) {
        return res.status(400).json({ message: "Order payload missing" });
      }
      if (typeof orderData === "string") {
        try {
          orderData = JSON.parse(orderData);
        } catch {
          return res
            .status(400)
            .json({ message: "Invalid JSON in `order` field" });
        }
      }

      let order = null;

      // 4. Update existing order if _id provided
      if (orderData._id) {
        // ===== replaced find+set+save with atomic findByIdAndUpdate =====
        order = await Order.findByIdAndUpdate(orderData._id, orderData, {
          new: true, // return the updated doc
          runValidators: true, // enforce your schema rules
        });
      }

      // 5. Create new order if no update happened
      if (!order) {
        const [last] = await Order.aggregate([
          { $project: { docNumber: 1, num: { $toInt: "$docNumber" } } },
          { $sort: { num: -1 } },
          { $limit: 1 },
        ]);
        const lastNumber = last?.num ?? 0;
        const nextDocNumber = (lastNumber + 1).toString();

        const newOrder = new Order({
          ...orderData,
          docNumber: nextDocNumber,
        });
        order = await newOrder.save();
      }

      return res.status(201).json({ order });
    }

    // 6. Method Not Allowed
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error in /api/orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    // 7. Always disconnect
    await db.disconnect();
  }
}
