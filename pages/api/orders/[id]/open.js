import { getToken } from "next-auth/jwt";
import db from "../../../../utils/db";
import Order from "../../../../models/Order";
import Estimate from "../../../../models/Estimate";
import Product from "../../../../models/Product";
import WpUser from "../../../../models/WpUser";

const handler = async (req, res) => {
  const wpUser = await getToken({ req });
  if (!wpUser) {
    return res.status(401).send("signin required");
  }

  const { id } = req.query;
  await db.connect();

  try {
    const openedOrders = await Order.find({
      "wpUser.userId": wpUser._id,
      status: "In Process",
    }).sort({ updatedAt: -1 });
    if (openedOrders.length > 0) {
      await Order.deleteMany({
        _id: { $in: openedOrders.map((order) => order._id) },
      });
    }

    const order = await Order.findById(id);
    let estimate = null;
    if (!order) {
      await db.disconnect();
      return res.status(404).send("Order not found");
    }
    console.log("wpUser", wpUser);
    const user = await WpUser.findById(wpUser._id);
    if (user) {
      user.cart = order.orderItems;
      await user.save();
    }

    if (order.status === "Completed") {
      // revert status and save
      order.status = "In Process";
      await order.save();
      // find the linked estimate
      estimate = await Estimate.findOne({ linkedWpOrderId: id });
      if (estimate) {
        // restore heldStock on each product
        for (const item of estimate.estimateItems) {
          const product = await Product.findById(item.productId);
          if (product) {
            product[item.typeOfPurchase].heldStock -= item.quantity;
            await product.save();
          }
        }
        await Estimate.deleteOne({ _id: estimate._id });
        estimate = null;
      }
    }

    await db.disconnect();
    return res.status(200).send({ order, user });
  } catch (error) {
    console.error("Error in /api/orders/[id]:", error);
    await db.disconnect();
    return res.status(500).send("Internal Server Error");
  }
};

export default handler;
