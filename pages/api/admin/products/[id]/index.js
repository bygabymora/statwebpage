import { getToken } from 'next-auth/jwt';
import Product from '../../../../../models/Product';
import db from '../../../../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send('signin required');
  }

  if (req.method === 'GET') {
    return getHandler(req, res, user);
  } else if (req.method === 'PUT') {
    return putHandler(req, res, user);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res, user);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};
const getHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  await db.disconnect();
  res.send(product);
};
const putHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  if (product) {
    product.name = req.body.name;
    product.manufacturer = req.body.manufacturer;
    product.slug = req.body.slug;
    product.lot = req.body.lot;
    product.expiration = req.body.expiration;
    product.image = req.body.image;
    product.reference = req.body.reference;
    product.description = req.body.description;
    product.price = req.body.price;
    product.size = req.body.size;
    product.countInStock = req.body.countInStock;
    product.notes = req.body.notes;
    product.includes = req.body.includes;
    await product.save();
    await db.disconnect();
    res.send({ message: 'Product updated successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Product not found' });
  }
};
const deleteHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query._id);
  console.log('Product ID: ', req.query._id); // log the product id
  console.log('Found product: ', product); // log the found product
  if (product) {
    await product.remove();
    await db.disconnect();
    res.send({ message: 'Product deleted successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Product not found' });
  }
};
export default handler;
