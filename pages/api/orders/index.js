// pages/api/orders/index.js

import { getToken } from "next-auth/jwt";
import Order from "../../../models/Order";
import db from "../../../utils/db";

const handler = async (req, res) => {
  // auth
  const user = await getToken({ req });
  if (!user) return res.status(401).send("signin required");

  await db.connect();

  if (req.method === "POST") {
    // parse orderData from either string or object
    let orderData;
    if (typeof req.body.order === "string") {
      try {
        orderData = JSON.parse(req.body.order);
      } catch {
        return res
          .status(400)
          .json({ message: "Invalid JSON in `order` field" });
      }
    } else if (typeof req.body.order === "object") {
      orderData = req.body.order;
    } else {
      return res.status(400).json({ message: "Order payload missing" });
    }

    let order = null;
    // update existing
    if (orderData._id) {
      order = await Order.findById(orderData._id);
      if (order) {
        // if you need to update any fields from orderData, do it here
        await order.save();
      }
    }

    // create new with next docNumber
    if (!order) {
      const [last] = await Order.aggregate([
        { $project: { docNumber: 1, num: { $toInt: "$docNumber" } } },
        { $sort: { num: -1 } },
        { $limit: 1 },
      ]);
      const lastNumber = last?.num ?? 0;
      const nextDocNumber = (lastNumber + 1).toString();

      order = new Order({
        ...orderData,
        docNumber: nextDocNumber,
      });
      await order.save();
    }

    return res.status(201).json({ order });
  }

  // you can add GET/PUT etc here
  return res.status(405).json({ message: "Method not allowed" });
};

export default handler;
