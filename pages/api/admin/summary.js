import { getToken } from "next-auth/jwt";
import Order from "../../../models/Order";
import Product from "../../../models/Product";
import WpUser from "../../../models/WpUser";
import db from "../../../utils/db";

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send("Registration required");
  }

  // Prevent caching to ensure fresh data
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  await db.connect(true);

  // Force fresh queries with read concern for latest data
  const ordersCount = await Order.countDocuments().read("primary");
  const productsCount = await Product.countDocuments().read("primary");
  const usersCount = await WpUser.countDocuments().read("primary");

  console.log(
    `[${new Date().toISOString()}] Dashboard summary: ${ordersCount} orders, ${productsCount} products, ${usersCount} users`,
  );

  const ordersPriceGroup = await Order.aggregate([
    {
      $group: {
        _id: null,
        sales: { $sum: "$totalPrice" },
      },
    },
  ]).read("primary");
  const ordersPrice =
    ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0;

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalSales: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 },
      },
    },
  ]).read("primary");

  const salesPerProduct = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.slug",
        totalSales: { $sum: "$orderItems.price" },
        totalQuantity: { $sum: "$orderItems.quantity" },
      },
    },
  ]).read("primary");

  const totalPricePerUser = await Order.aggregate([
    {
      $lookup: {
        from: "users", // Note: This is the name of the collection, not the model. It's usually the pluralized form of the model name. Make sure it's correct in your DB.
        localField: "user",
        foreignField: "_id",
        as: "userDetail",
      },
    },
    {
      $unwind: "$userDetail", // Since userDetail is an array after lookup, we unwind it.
    },
    {
      $group: {
        _id: "$userDetail.name", // Group by user name now
        totalSpent: { $sum: "$totalPrice" },
      },
    },
  ]).read("primary");

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
