import { getToken } from 'next-auth/jwt';
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const user = await getToken({ req });
  if (!user) {
    return res.status(401).send('signin required');
  }
  if (req.method === 'POST') {
    console.log('Body received:', req.body);

    try {
      const { totalPrice, orderId } = req.body;

      console.log('Received price:', totalPrice);
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'USD',
              product_data: {
                name: 'Order Total',
                description: 'test',
              },
              unit_amount: totalPrice * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}?paymentSuccess=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}`,
      });
      res.redirect(303, session.url);
    } catch (err) {
      console.error('Stripe Checkout Session Error:', err);
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
