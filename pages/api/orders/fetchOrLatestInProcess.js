import db from "../../../utils/db";
import Order from "../../../models/Order";
import { getToken } from "next-auth/jwt";

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

    if (orderId) {
      order = await Order.findById(orderId);
    } else {
      order = await Order.findOne({
        "wpUser.userId": userId,
        status: "In Process",
      }).sort({ updatedAt: -1 });
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

    return res.status(200).json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await db.disconnect();
  }
};

export default handler;
