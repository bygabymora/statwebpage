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
    await db.connect(true);

    const orders = await Order.find({
      "wpUser.userId": token._id,
      status: "Completed",
    }).sort({ createdAt: -1 });

    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        const updatedOrder = order.toObject(); // convert to plain JS object

        let estimate =
          (order.estimateId ?
            await Estimate.findById(order.estimateId)
          : null) || (await Estimate.findOne({ linkedWpOrderId: order._id }));

        let invoice = null;
        if (estimate) {
          invoice =
            (estimate.invoice?.invoiceId ?
              await Invoice.findById(estimate.invoice.invoiceId)
            : null) || (await Invoice.findOne({ estimate: estimate._id }));
        }
        // Invoice stores the order id as a string, unlike Estimate.
        if (!invoice) {
          invoice = await Invoice.findOne({
            linkedWpOrderId: String(order._id),
          });
        }
        if (invoice && !estimate && invoice.estimate) {
          estimate = await Estimate.findById(invoice.estimate);
        }

        if (estimate) {
          updatedOrder.estimate = estimate;

          if (estimate.customer?.user?.userId) {
            const accountOwner = await User.findById(
              estimate.customer.user.userId,
            );
            if (accountOwner) {
              updatedOrder.accountOwner = {
                name: accountOwner.name,
                email: accountOwner.email,
                phone: accountOwner.phone,
              };
            }
          }
        }

        if (invoice) {
          updatedOrder.invoice = invoice;
        }

        return updatedOrder;
      }),
    );

    res.send(updatedOrders);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error });
  }
};

export default handler;
