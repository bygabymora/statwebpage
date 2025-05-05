import { getToken } from "next-auth/jwt";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export default async function handler(req, res) {
  const user = await getToken({ req });

  if (!user) {
    return res.status(401).json({ message: "Sign-in required" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    let { totalPrice, orderId } = req.body;

    // Ensure totalPrice is number
    totalPrice = Number(totalPrice);
    if (!totalPrice || isNaN(totalPrice)) {
      return res.status(400).json({ message: "Invalid totalPrice" });
    }

    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId" });
    }

    const amount = Math.round(totalPrice * 100);
    if (amount < 50) {
      return res.status(400).json({ message: "Total must be at least $0.50" });
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
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}?paymentSuccess=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}?paymentSuccess=false`,
    });

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe Checkout Session Error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        typeof error.message === "string"
          ? error.message
          : "Unexpected error during Stripe session creation",
    });
  }
}
