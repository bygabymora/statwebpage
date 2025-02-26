import { getSession } from 'next-auth/react';
import WpUser from '../../../../models/WpUser';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('Admin signin required');
  }
  await db.connect();
  const users = await WpUser.find({});
  await db.disconnect();
  res.send(users);
};

export default handler;
