import { getToken } from 'next-auth/jwt';
import Order from '../../../models/Order';
import db from '../../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user) {
    return res.status(401).send({ message: 'signin required' });
  }
  await db.connect();
  const lastOrder = await Order.findOne({ user: user._id }).sort({
    createdAt: -1,
  });
  await db.disconnect();

  if (lastOrder) {
    res.send(lastOrder);
  } else {
    res.status(200).send({ message: 'No orders found', warning: true });
  }
};

export default handler;
