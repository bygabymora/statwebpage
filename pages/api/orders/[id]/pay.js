import { getToken } from "next-auth/jwt";
import Order from "../../../../models/Order";
import db from "../../../../utils/db";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

function safeBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch {
      return {};
    }
  }
  if (typeof req.body === "object") return req.body;
  return {};
}

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const orderId = req.query?.id;
  if (!orderId)
    return res.status(400).json({ message: "Missing order id in URL" });

  if (!stripeSecret) {
    return res.status(500).json({ message: "Missing STRIPE_SECRET_KEY" });
  }

  const user = await getToken({ req }).catch(() => null);
  if (!user) return res.status(401).send("Error: signin required");

  try {
    await db.connect(true);
  } catch {
    return res
      .status(503)
      .json({ message: "Service unavailable: Database connection failed" });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2022-11-15" });

  // Lee identificadores posibles
  const body = safeBody(req);
  const sessionIdFromBody = body.sessionId || body.session_id || null;
  const piIdFromBody = body.paymentIntentId || body.payment_intent || null;
  const sessionIdFromQuery = req.query.session_id || null;
  const piIdFromQuery = req.query.payment_intent || null;

  // 1) Buscar orden
  let order;
  try {
    order = await Order.findById(orderId);
  } catch (error) {
    if (error?.name === "CastError") {
      return res
        .status(400)
        .json({ message: "Validating the payment, please wait..." });
    }
    return res.status(500).json({ message: "Error finding order" });
  }
  if (!order)
    return res.status(404).json({ message: "Error: order not found" });

  // Idempotencia: si ya está pagada, 200
  if (order.isPaid) {
    return res
      .status(200)
      .json({ message: "Payment already processed", order });
  }

  // 2) Resolver paymentIntentId (SIN depender de order.paymentId)
  let paymentIntentId = piIdFromBody || piIdFromQuery || null;

  try {
    if (!paymentIntentId) {
      const sessionId = sessionIdFromBody || sessionIdFromQuery || null;
      if (sessionId) {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ["payment_intent"],
        });
        paymentIntentId =
          session?.payment_intent?.id || session?.payment_intent || null;
      }
    }

    // Fallback por compatibilidad: si alguien guardó algo en order.paymentId
    if (!paymentIntentId && order?.paymentId) {
      paymentIntentId = order.paymentId;
    }

    if (!paymentIntentId) {
      return res
        .status(400)
        .json({ message: "Missing paymentIntentId or sessionId" });
    }
  } catch {
    return res.status(400).json({ message: "Stripe session lookup failed" });
  }

  // 3) Traer PaymentIntent
  let paymentIntent = null;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch {
    return res
      .status(400)
      .json({ message: "Stripe paymentIntent lookup failed" });
  }

  const status = paymentIntent?.status;
  if (status !== "succeeded" && status !== "requires_capture") {
    return res
      .status(409)
      .json({ message: `PaymentIntent not payable yet (status=${status})` });
  }

  // 4) Persistir pago e idempotencia
  try {
    order.isPaid = true;
    order.paidAt = Date.now();

    // Ahora sí guarda un paymentId real para tu UI
    order.paymentId = paymentIntent.id;

    order.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount_received,
      currency: paymentIntent.currency,
      email_address: paymentIntent.receipt_email,
      payment_method: paymentIntent.payment_method,
      receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || null,
      charge_id: paymentIntent.latest_charge,
      created: paymentIntent.created,
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
