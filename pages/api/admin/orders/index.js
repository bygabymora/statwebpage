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
      estimates.map((estimate) => [String(estimate.linkedWpOrderId), estimate]),
    );

    // Any of the three links is enough to find the invoice.
    const invoiceIds = estimates
      .map((estimate) => estimate.invoice?.invoiceId)
      .filter(Boolean);
    const invoices = await Invoice.find({
      $or: [
        { _id: { $in: invoiceIds } },
        { estimate: { $in: estimates.map((estimate) => estimate._id) } },
        { linkedWpOrderId: { $in: completedOrderIds.map(String) } },
      ],
    });
    const invoiceById = new Map(
      invoices.map((invoice) => [String(invoice._id), invoice]),
    );
    const invoiceByEstimate = new Map(
      invoices
        .filter((invoice) => invoice.estimate)
        .map((invoice) => [String(invoice.estimate), invoice]),
    );
    const invoiceByOrderId = new Map(
      invoices
        .filter((invoice) => invoice.linkedWpOrderId)
        .map((invoice) => [String(invoice.linkedWpOrderId), invoice]),
    );

    const ordersWithInvoice = orders.map((order) => {
      const plainOrder = order.toObject();
      const estimate = estimateByOrderId.get(String(order._id));
      const invoice =
        (estimate?.invoice?.invoiceId ?
          invoiceById.get(String(estimate.invoice.invoiceId))
        : null) ||
        (estimate ? invoiceByEstimate.get(String(estimate._id)) : null) ||
        invoiceByOrderId.get(String(order._id));
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
