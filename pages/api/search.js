import db from '../../utils/db';
import Product from '../../models/Product';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await db.connect();
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { manufacturer: { $regex: req.query.keyword, $options: 'i' } },
            { gtin: { $regex: req.query.keyword, $options: 'i' } },
            { "each.description": { $regex: req.query.keyword, $options: 'i' } },
            { "box.description": { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const products = await Product.find({ ...keyword });
    

    await db.disconnect();
    res.status(200).json(products);
  } catch (error) {
    await db.disconnect();
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
