import { getToken } from "next-auth/jwt";
import db from "../../../utils/db";
import Order from "../../../models/Order";
import Estimate from "../../../models/Estimate";
import Invoice from "../../../models/Invoice";
import User from "../../../models/User";

const handler = async (req, res) => {
  const token = await getToken({ req });

  if (!token) {
    return res.status(401).send({ message: "signin required" });
  }

  try {
    await db.connect();

    const orders = await Order.find({
      "wpUser.userId": token._id,
      status: "Completed",
    }).sort({ createdAt: -1 });

    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        const updatedOrder = order.toObject(); // convert to plain JS object
        const estimate = await Estimate.findOne({
          linkedWpOrderId: order._id,
        });
        console.log("estimate", estimate);
        if (estimate) {
          updatedOrder.estimate = estimate;

          if (estimate.customer?.user?.userId) {
            const accountOwner = await User.findById(
              estimate.customer.user.userId
            );
            if (accountOwner) {
              updatedOrder.accountOwner = {
                name: accountOwner.name,
                email: accountOwner.email,
                phone: accountOwner.phone,
              };
            }
          }

          if (estimate.invoice?.invoiceId) {
            const invoice = await Invoice.findById(estimate.invoice.invoiceId);
            if (invoice) {
              updatedOrder.invoice = invoice;
            }
          }
        }

        return updatedOrder;
      })
    );

    await db.disconnect();
    res.send(updatedOrders);
  } catch (error) {
    await db.disconnect();
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default handler;
