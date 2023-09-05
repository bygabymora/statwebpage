import db from '../../../utils/db';
import News from '../../../models/News';

const handler = async (req, res) => {
  await db.connect();
  const product = await News.findById(req.query.id).lean();
  await db.disconnect();
  res.send(product);
};

export default handler;
