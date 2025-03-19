import { getToken } from 'next-auth/jwt';
import Product from '../../../../../models/Product';
import db from '../../../../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send('Sign-in required');
  }

  if (req.method === 'PUT') {
    return updateProduct(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const updateProduct = async (req, res) => {
  try {
    await db.connect();
    const product = await Product.findById(req.query.id);

    if (product) {
      if (req.body.price !== undefined) {
        product.price = req.body.price;
      }
      if (req.body.priceBox !== undefined) {
        product.priceBox = req.body.priceBox;
      }
      if (req.body.priceClearance !== undefined) {
        product.priceClearance = req.body.priceClearance;
      }
      if (req.body.countInStock !== undefined) {
        product.countInStock = req.body.countInStock;
      }
      if (req.body.countInStockBox !== undefined) {
        product.countInStockBox = req.body.countInStockBox;
      }
      if (req.body.countInStockClearance !== undefined) {
        product.countInStockClearance = req.body.countInStockClearance;
      }

      // Save the updated product
      await product.save();
      await db.disconnect();

      res.status(200).send({ message: 'Product updated successfully' });
    } else {
      await db.disconnect();
      res.status(404).send({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
};

export default handler;
