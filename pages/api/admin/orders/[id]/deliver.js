import { getToken } from 'next-auth/jwt';
import Order from '../../../../../models/Order';
import db from '../../../../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });

  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send('Error: signin required');
  }

  if (req.method === 'PUT') {
    return putHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const putHandler = async (req, res) => {
  await db.connect();

  const order = await Order.findById(req.query.id);
  const { trackUrl, trackNumber } = req.body;

  if (order) {
    order.trackUrl = trackUrl;
    order.trackNumber = trackNumber;
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();

    await db.disconnect();
    res.send({
      message: 'Order updated and processed successfully',
      order: updatedOrder,
    });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Order not found' });
  }
};

export default handler;
