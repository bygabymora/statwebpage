// /api/orders/:id
import { getToken } from "next-auth/jwt";
import Order from "../../../../models/Order";
import db from "../../../../utils/db";
import Estimate from "../../../../models/Estimate";
import Invoice from "../../../../models/Invoice";
import User from "../../../../models/User";

const handler = async (req, res) => {
  const wpUsers = await getToken({ req });
  if (!wpUsers) {
    return res.status(401).send("signin required");
  }

  const { id } = req.query;

  await db.connect();

  try {
    const order = await Order.findById(id);
    let estimate = null;
    let invoice = null;
    let accountOwner = null;
    if (!order) {
      return res.status(404).send("Order not found");
    }
    if (order.status === "Completed") {
      estimate = await Estimate.findOne({ linkedWpOrderId: id });
      if (estimate) {
        accountOwner = await User.findById(estimate.customer?.user?.userId);
        if (accountOwner) {
          accountOwner = {
            name: accountOwner.name,
            email: accountOwner.email,
            phone: accountOwner.phone,
          };
        }
      }
      if (estimate && estimate.invoice?.invoiceId) {
        invoice = await Invoice.findById(estimate.invoice.invoiceId);
      }
    }
    await db.disconnect();
    res.status(200).send({ order, estimate, invoice, accountOwner });
  } catch (error) {
    console.error("Error in /api/orders/[id]:", error);
    await db.disconnect();
    res.status(500).send("Internal Server Error");
  }
};

export default handler;
