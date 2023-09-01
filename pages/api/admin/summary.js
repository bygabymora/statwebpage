import { getToken } from 'next-auth/jwt';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import User from '../../../models/user';
import db from '../../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send('Registro requerido');
  }

  await db.connect();

  const ordersCount = await Order.countDocuments();
  const productsCount = await Product.countDocuments();
  const usersCount = await User.countDocuments();

  const ordersPriceGroup = await Order.aggregate([
    {
      $group: {
        _id: null,
        sales: { $sum: '$totalPrice' },
      },
    },
  ]);
  const ordersPrice =
    ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0;

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  const salesPerProduct = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.slug',
        totalSales: { $sum: '$orderItems.price' },
        totalQuantity: { $sum: '$orderItems.quantity' },
      },
    },
  ]);

  const totalPricePerUser = await Order.aggregate([
    {
      $lookup: {
        from: 'users', // Note: This is the name of the collection, not the model. It's usually the pluralized form of the model name. Make sure it's correct in your DB.
        localField: 'user',
        foreignField: '_id',
        as: 'userDetail',
      },
    },
    {
      $unwind: '$userDetail', // Since userDetail is an array after lookup, we unwind it.
    },
    {
      $group: {
        _id: '$userDetail.name', // Group by user name now
        totalSpent: { $sum: '$totalPrice' },
      },
    },
  ]);

  await db.disconnect();
  res.send({
    ordersCount,
    productsCount,
    usersCount,
    ordersPrice,
    salesData,
    salesPerProduct,
    totalPricePerUser,
  });
};

export default handler;
