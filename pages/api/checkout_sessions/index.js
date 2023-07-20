import { CURRENCY, MAX_AMOUNT, MIN_AMOUNT } from '../../../config';
import { formatAmountForStripe } from '../../../utils/stripe-helpers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-08-01',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const amount = req.body.amount;
    try {
      if (!(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT)) {
        throw new Error('Invalid amount.');
      }
      const params = {
        submit_type: 'donate',
        payment_method_types: ['card'],
        line_items: [
          {
            amount: formatAmountForStripe(amount, CURRENCY),
            quantity: 1,
            price_data: {
              currency: CURRENCY,
              product_data: {
                name: 'Custom amount donation',
              },
            },
          },
        ],
        success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/donate-with-checkout`,
      };
      const checkoutSession = await stripe.checkout.sessions.create(params);

      res.status(200).json(checkoutSession);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ statusCode: 500, message: errorMessage });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
