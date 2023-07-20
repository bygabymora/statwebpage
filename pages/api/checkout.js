import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Extract the necessary information from the request body
    const { paymentMethod } = req.body;

    // Add your logic here to determine the payment method selected by the user
    if (paymentMethod === 'stripe') {
      // Implement Stripe checkout here
      // Redirect the user to the Stripe checkout page
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd', // Change this to your desired currency
              product_data: {
                name: 'Your Product Name', // Change this to your product name
              },
              unit_amount: 1000, // Change this to your product price (in cents)
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'https://example.com/success', // Change this to your success URL
        cancel_url: 'https://example.com/cancel', // Change this to your cancel URL
      });

      return res.status(200).json({ sessionId: session.id });
    } else if (paymentMethod === 'payByWire') {
      // Redirect the user to the "bankInformation" page
      return res.status(200).json({ redirectTo: '/bankInformation' });
    } else {
      // Handle invalid payment method selection
      return res.status(400).json({ message: 'Invalid payment method' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}
