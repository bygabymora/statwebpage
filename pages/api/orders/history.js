import { getToken } from 'next-auth/jwt';
import Order from '../../../models/Order';
import db from '../../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user) {
    return res.status(401).send({ message: 'signin required' });
  }
  await db.connect();
  const orders = await Order.find({ WpUser: user._id }).sort({ createdAt: -1 });
  await db.disconnect();
  res.send(orders);
};

export default handler;
