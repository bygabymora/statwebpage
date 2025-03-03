import { getToken } from 'next-auth/jwt';
import Order from '../../../models/Order';
import db from '../../../utils/db';

const handler = async (req, res) => {
  try {
    const user = await getToken({ req });
    if (!user) {
      return res.status(401).send('signin required');
    }

    await db.connect();
    const newOrder = new Order({
      ...req.body,
      WpUser: user._id,
    });

    const order = await newOrder.save();
    res.status(201).send(order);
  } catch (error) {
    console.error('Error in /api/orders:', error);
    res.status(500).send('Internal Server Error');
  }
};

export default handler;
