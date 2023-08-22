// pages/api/search.js

import db from '../../utils/db';
import Product from '../../models/Product';

export default async function handler(req, res) {
  await db.connect();
  const keyword = req.query.keyword
    ? {
        $or: [
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
