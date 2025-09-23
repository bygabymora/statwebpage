import { getToken } from "next-auth/jwt";
import Stripe from "stripe";
import Order from "../../models/Order";
import db from "../../utils/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export default async function handler(req, res) {
  const user = await getToken({ req });
  if (!user) return res.status(401).send("signin required");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};
    const { totalPrice, orderId } = body;

    if (typeof totalPrice !== "number" || !orderId) {
      return res.status(400).json({ message: "Missing totalPrice or orderId" });
    }

    const rawBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://www.statsurgicalsupply.com";
    const baseUrl = rawBaseUrl.replace(/\/+$/, "");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Order Total",
              description: "Your order total",
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/order/${orderId}?paymentSuccess=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/order/${orderId}?paymentSuccess=false`,
      customer_creation: "if_required",
      metadata: { orderId },
    });

    try {
      await db.connect(true);
      const order = await Order.findById(orderId);
      if (order) {
        order.checkoutSessionId = session.id;
        await order.save();
      }
    } catch (e) {
      console.warn("Could not persist checkoutSessionId:", e?.message || e);
    }

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe Checkout Session Error:", error);
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}
