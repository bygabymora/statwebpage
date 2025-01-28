import db from '../../utils/db';
import Product from '../../models/Product';

export default async function handler(req, res) {
  
  try {
    await db.connect(true); // Try to reconnect
  } catch {
    return res
      .status(503)
      .json({ message: 'Service unavailable: Database connection failed' });
  }


const keyword = req.query.keyword
  ? {
      $or: [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { manufacturer: { $regex: req.query.keyword, $options: 'i' } },
        { slug: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
        { descriptionBulk: { $regex: req.query.keyword, $options: 'i' } },
      ],
    }
  : {};

const products = await Product.find({ ...keyword });

  await db.disconnect();

res.send(products);
}
