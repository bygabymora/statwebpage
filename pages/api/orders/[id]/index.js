// /api/orders/:id
import { getToken } from 'next-auth/jwt';
import Order from '../../../../models/Order';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const wpUsers = await getToken({ req });
  if (!wpUsers) {
    return res.status(401).send('signin required');
  }

  const { id } = req.query;

  await db.connect();

  try {
    const order = await Order.findById(id).populate('WpUser', 'name email');
    if (!order) {
      return res.status(404).send('Order not found');
    }

    await db.disconnect();
    res.status(200).send(order);
  } catch (error) {
    console.error('Error in /api/orders/[id]:', error);
    await db.disconnect();
    res.status(500).send('Internal Server Error');
  }
};

export default handler;
