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
const postHandler = async (res) => {
  await db.connect();
  const newProduct = new Product({
    name: 'sample name',
    manufacturer: 'sample manufacturer',
    slug: 'sample-name-' + Math.random(),
    lot: 'sample lot',
    expiration: 'sample expiration',
    image:
      'https://res.cloudinary.com/dcjahs0jp/image/upload/v1692313973/tgesmy2eeunhammc5koa.png',
    description: 'sample description',
    descriptionBox: 'sample description box',
    price: 0,
    priceBox: 0,
    each: 'sample each',
    box: 'sample box',
    countInStock: 0,
    countInStockBox: 0,
    isInClearance: false,
    descriptionClearance: 'sample description clearance',
    countInStockClearance: 0,
    priceClearance: 0,
    sentOverNight: false,
    notes: 'sample notes',
    includes: 'sample includes',
  });

  const product = await newProduct.save();
  await db.disconnect();
  res.send({ message: 'Product created successfully', product });
};
// ...
const getHandler = async (req, res) => {
  await db.connect();

  try {
    const sortDirection = req.query.sort === 'asc' ? 1 : -1; // Determine the sort direction from the query parameter

    let sortField = 'slug';
    if (sortDirection === -1) {
      sortField = `-${sortField}`;
    }

    const products = await Product.find({}).sort(sortField);

    res.send(products);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching products', error });
  } finally {
    await db.disconnect();
  }
};
// ...

export default handler;
