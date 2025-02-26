import WpUser from '../../../models/WpUser';
import db from '../../../utils/db';
import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user) {
    return res.status(401).send('Login required');
  }

  if (req.method === 'GET') {
    return getHandler(req, res, user);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  await db.connect();
  const user = await WpUser.findById(req.query.id);
  await db.disconnect();
  res.send(user);
};

export default handler;
