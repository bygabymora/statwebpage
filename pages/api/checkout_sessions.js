import { getToken } from "next-auth/jwt";
import Stripe from "stripe";
import Order from "../../models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export default async function handler(req, res) {
  const user = await getToken({ req });

  if (!user) {
    return res.status(401).send("signin required");
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { totalPrice, orderId } = req.body;

    if (!totalPrice || !orderId) {
      return res.status(400).json({ message: "Missing totalPrice or orderId" });
    }

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}?paymentSuccess=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}?paymentSuccess=false`,
    });
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentId = session.payment_intent;
      await order.save();
    }
    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe Checkout Session Error:", error);
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}
