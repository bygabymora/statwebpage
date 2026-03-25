import { getToken } from "next-auth/jwt";
import Order from "../../../../models/Order";
import db from "../../../../utils/db";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const orderId = req.query?.id;
  if (!orderId)
    return res.status(400).json({ message: "Missing order id in URL" });

  const user = await getToken({ req }).catch(() => null);
  if (!user) return res.status(401).send("Error: signin required");

  const body = req.body || {};

  // PayPal capture details must include id and status
  const paypalOrderId = body.id;
  const paypalStatus = body.status;

  if (!paypalOrderId || !paypalStatus) {
    return res
      .status(400)
      .json({ message: "Missing PayPal payment details (id, status)" });
  }

  if (paypalStatus !== "COMPLETED") {
    return res
      .status(409)
      .json({
        message: `PayPal payment not completed (status=${paypalStatus})`,
      });
  }

  try {
    await db.connect(true);
  } catch {
    return res
      .status(503)
      .json({ message: "Service unavailable: Database connection failed" });
  }

  let order;
  try {
    order = await Order.findById(orderId);
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(400).json({ message: "Invalid order id" });
    }
    return res.status(500).json({ message: "Error finding order" });
  }

  if (!order)
    return res.status(404).json({ message: "Error: order not found" });

  // Idempotency: if already paid, return 200
  if (order.isPaid) {
    return res
      .status(200)
      .json({ message: "Payment already processed", order });
  }

  try {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentId = paypalOrderId;

    const payer = body.payer || {};
    order.paymentResult = {
      id: paypalOrderId,
      status: paypalStatus,
      amount:
        body.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?
          Number(body.purchase_units[0].payments.captures[0].amount.value)
        : null,
      currency:
        body.purchase_units?.[0]?.payments?.captures?.[0]?.amount
          ?.currency_code || "USD",
      email_address: payer.email_address || null,
      payment_method: "PayPal",
      created:
        body.update_time ? new Date(body.update_time).getTime() / 1000 : null,
    };

    const paidOrder = await order.save();
    return res
      .status(200)
      .json({ message: "order paid successfully", order: paidOrder });
  } catch {
    return res
      .status(500)
      .json({ message: "Error while processing the order" });
  }
}
