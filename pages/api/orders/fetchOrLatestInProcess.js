import db from "../../../utils/db";
import Order from "../../../models/Order";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import WpUser from "../../../models/WpUser";

const handler = async (req, res) => {
  try {
    await db.connect();
    const token = await getToken({ req });

    if (!token) {
      return res.status(401).json({ message: "Signin required" });
    }

    const userId = token._id;
    const { orderId } = req.query;

    let order;
    let wpUser;
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    } else {
      order = await Order.findOne({
        "wpUser.userId": userId,
        status: "In Process",
      }).sort({ updatedAt: -1 });
    }
    wpUser = await WpUser.findById(token._id);
    if (wpUser) {
      if (wpUser.cart?.length === 0 && order?.orderItems?.length > 0) {
        wpUser.cart = order.orderItems;
        await wpUser.save();
      }
    }
    if (!order) {
      order = {
        orderItems: [],
        shippingAddress: {},
        paymentMethod: "",
        itemsPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: 0,
      };
    }

    console.log("oser in api", order);
    console.log("wpUser in api", wpUser);

    return res.status(200).json({ order, wpUser });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await db.disconnect();
  }
};

export default handler;
