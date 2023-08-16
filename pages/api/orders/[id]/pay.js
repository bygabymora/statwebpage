import { getToken } from 'next-auth/jwt';
import Order from '../../../../models/Order';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  // Validate the order ID
  const orderId = req.query.id;
  if (!orderId) {
    return res.status(400).json({ message: 'Validating...' });
  }

  const user = await getToken({ req });
  if (!user) {
    return res.status(401).send('Error: signin required');
  }

  await db.connect();

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      await db.disconnect();
      return res.status(404).send({ message: 'Error: order not found' });
    }

    if (order.isPaid) {
      await db.disconnect();
      return res.status(400).send({ message: 'Error: order is already paid' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      email_address: req.body.email_address,
    };
    const paidOrder = await order.save();

    await db.disconnect();
    res.send({ message: 'order paid successfully', order: paidOrder });
  } catch (error) {
    // Check if the error is a CastError and respond accordingly
    if (error.name === 'CastError') {
      await db.disconnect();
      return res
        .status(400)
        .json({ message: 'Validating the payment, please wait...' });
    }
    // Handle any other errors here
    await db.disconnect();
    res
      .status(500)
      .send({ message: 'Error while processing the order', error });
  }
};

export default handler;
