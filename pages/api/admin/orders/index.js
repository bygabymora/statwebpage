import { getToken } from "next-auth/jwt";
import Order from "../../../../models/Order";
import Estimate from "../../../../models/Estimate";
import Invoice from "../../../../models/Invoice";
import db from "../../../../utils/db";

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send("signin required");
  }
  if (req.method === "GET") {
    await db.connect(true);
    const orders = await Order.find({})
      .populate("wpUser", "name email")
      .sort({ createdAt: -1 });

    const completedOrderIds = orders
      .filter((order) => order.status === "Completed")
      .map((order) => order._id);

    const estimates = await Estimate.find({
      linkedWpOrderId: { $in: completedOrderIds },
    });
    const estimateByOrderId = new Map(
      estimates.map((estimate) => [String(estimate.linkedWpOrderId), estimate])
    );

    const invoiceIds = estimates
      .map((estimate) => estimate.invoice?.invoiceId)
      .filter(Boolean);
    const invoices = await Invoice.find({ _id: { $in: invoiceIds } });
    const invoiceById = new Map(
      invoices.map((invoice) => [String(invoice._id), invoice])
    );

    const ordersWithInvoice = orders.map((order) => {
      const plainOrder = order.toObject();
      const estimate = estimateByOrderId.get(String(order._id));
      const invoice = estimate?.invoice?.invoiceId
        ? invoiceById.get(String(estimate.invoice.invoiceId))
        : null;
      if (invoice) {
        plainOrder.invoice = invoice;
      }
      return plainOrder;
    });

    res.send(ordersWithInvoice);
  } else {
    return res.status(400).send({ message: "Method not allowed" });
  }
};

export default handler;
