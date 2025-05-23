import db from "../../../utils/db";
import Order from "../../../models/Order";
import WpUser from "../../../models/WpUser";
import Product from "../../../models/Product";
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // connect & authenticate
    await db.connect(true);
    const token = await getToken({ req });
    if (!token) return res.status(401).json({ message: "Signin required" });
    const userId = token._id;

    // always load the most recently updated 'In Process' order
    let order = await Order.findOne({
      "wpUser.userId": userId,
      status: "In Process",
    })
      .sort({ updatedAt: -1 })
      .exec();

    // if none, create a new one
    if (!order) {
      const [last] = await Order.aggregate([
        { $project: { docNumber: 1, num: { $toInt: "$docNumber" } } },
        { $sort: { num: -1 } },
        { $limit: 1 },
      ]);
      const lastNumber = last?.num ?? 0;
      const nextDocNumber = (lastNumber + 1).toString();
      order = new Order({
        wpUser: { userId, name: token.name, email: token.email },
        orderItems: [],
        shippingAddress: {},
        paymentMethod: "",
        itemsPrice: 0,
        totalPrice: 0,
        docNumber: nextDocNumber,
        status: "In Process",
      });
      await order.save();
    }

    // load WP user
    const wpUser = await WpUser.findById(userId);
    if (!wpUser) return res.status(404).json({ message: "User not found" });

    // decide which cart to use
    let sourceCart = [];
    if (Array.isArray(wpUser.cart) && wpUser.cart.length > 0) {
      sourceCart = wpUser.cart;
    } else if (Array.isArray(order.orderItems) && order.orderItems.length) {
      sourceCart = order.orderItems;
      wpUser.cart = sourceCart;
      await wpUser.save();
    }

    // bulk-fetch products
    const productIds = sourceCart.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    // enrich + stock-check
    const updatedCart = [];
    const warnings = [];
    for (const item of sourceCart) {
      const prod = products.find((p) => p._id.toString() === item.productId);
      const info =
        item.typeOfPurchase === "Each"
          ? prod.each
          : item.typeOfPurchase === "Box"
          ? prod.box
          : item.typeOfPurchase === "Clearance"
          ? prod.clearance
          : {};

      const available = info.quickBooksQuantityOnHandProduction || 0;
      if (available === 0) {
        warnings.push({
          name: prod.name,
          previousQuantity: item.quantity,
          availableQuantity: 0,
        });
        continue;
      }

      let finalQty = item.quantity;
      if (item.quantity > available) {
        warnings.push({
          name: prod.name,
          previousQuantity: item.quantity,
          availableQuantity: available,
        });
        finalQty = available;
      }

      updatedCart.push({
        ...item,
        productId: prod._id,
        quantity: finalQty,
        name: prod.name,
        manufacturer: prod.manufacturer,
        image: prod.image,
        slug: prod.slug,
        approved: true,
        productSearchQuery: prod.name,
        sentOverNight: prod.sentOverNight,
        noExpirationDate: prod.noExpirationDate,
        heldStock: prod.heldStock,
        quickBooksItemIdProduction:
          info.quickBooksItemIdProduction ?? prod.quickBooksItemIdProduction,
        minSalePrice: info.minSalePrice ?? info.price ?? prod.minSalePrice,
        description: info.description ?? prod.description,
        price: info.wpPrice ?? info.price ?? prod.price,
        countInStock:
          info.quickBooksQuantityOnHandProduction ?? prod.countInStock,
        updatedAt: prod.updatedAt,
      });
    }

    // update WP user cart
    wpUser.cart = updatedCart;
    await wpUser.save();

    // map back to orderItems schema
    order.orderItems = updatedCart.map((it) => ({
      productId: it.productId,
      typeOfPurchase: it.typeOfPurchase,
      quantity: it.quantity,
      price: it.price,
      totalPrice: Number(it.quantity) * Number(it.price),
    }));

    // recalc totals & save
    order.itemsPrice = order.orderItems.reduce(
      (acc, i) => acc + i.totalPrice,
      0
    );
    order.totalPrice = order.itemsPrice;
    order.status = "In Process";
    await order.save();

    // retrieve fresh order and respond
    const fresh = await Order.findById(order._id).lean();
    const responseOrder = {
      ...fresh,
      orderItems: updatedCart.map((it) => ({
        ...it,
        totalPrice: Number(it.quantity) * Number(it.price),
        status: "In Process",
      })),
    };

    return res.status(200).json({ order: responseOrder, wpUser, warnings });
  } catch (err) {
    console.error("❌ fetchOrLatestInProcess:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
