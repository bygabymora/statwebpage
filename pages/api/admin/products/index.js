import { getToken } from 'next-auth/jwt';
import Product from '../../../../models/Product';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || !user.isAdmin) {
    return res.status(401).send('admin signin required');
  }
  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'POST') {
    return postHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};
const postHandler = async (req, res) => {
  await db.connect();
  const newProduct = new Product({
    name: 'sample name',
    manufacturer: 'sample manufacturer',
    slug: 'sample-name-' + Math.random(),
    lot: 'sample lot',
    expiration: 'sample expiration',
    image: '/images/product.jpg',
    description: 'sample description',
    descriptionBulk: 'sample description bulk',
    price: 0,
    priceBulk: 0,
    each: 'sample each',
    bulk: 'sample bulk',
    countInStock: 0,
    countInStockBulk: 0,
    sentOverNight: false,
    notes: 'sample notes',
    includes: 'sample includes',
  });

  const product = await newProduct.save();
  await db.disconnect();
  res.send({ message: 'Product created successfully', product });
};
const getHandler = async (req, res) => {
  await db.connect();
  const products = await Product.find({});
  await db.disconnect();
  res.send(products);
};
export default handler;
