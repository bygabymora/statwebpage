import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import db from "../../../utils/db";
import Order from "../../../models/Order";
import WpUser from "../../../models/WpUser";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // 1) Connect & authenticate
    await db.connect(true);
    const token = await getToken({ req });
    if (!token) return res.status(401).json({ message: "Signin required" });
    const userId = token._id;
    const { orderId } = req.query;

    // 2) Load or create the “In Process” order
    let order =
      orderId && mongoose.Types.ObjectId.isValid(orderId)
        ? await Order.findById(orderId)
        : await Order.findOne({
            "wpUser.userId": userId,
            status: "In Process",
          }).sort({ updatedAt: -1 });

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

    // 3) Load WP user
    const wpUser = await WpUser.findById(userId);
    if (!wpUser) return res.status(404).json({ message: "User not found" });

    // 4) Decide which cart to use as the source
    let sourceCart = [];
    if (Array.isArray(wpUser.cart) && wpUser.cart.length > 0) {
      sourceCart = wpUser.cart;
    } else if (Array.isArray(order.orderItems) && order.orderItems.length > 0) {
      sourceCart = order.orderItems;
      wpUser.cart = sourceCart;
      await wpUser.save();
    }

    // 5) Bulk-fetch all Products
    const productIds = sourceCart.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    // 6) Enrich + stock-check → updatedCart & warnings
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

      const available = info.countInStock || 0;

      // sold out → skip & warn
      if (available === 0) {
        warnings.push({
          name: prod.name,
          previousQuantity: item.quantity,
          availableQuantity: 0,
        });
        continue;
      }

      // cap over-quantity
      let finalQty = item.quantity;
      if (item.quantity > available) {
        warnings.push({
          name: prod.name,
          previousQuantity: item.quantity,
          availableQuantity: available,
        });
        finalQty = available;
      }

      // build enriched item
      updatedCart.push({
        ...item,
        productId: prod._id,
        quantity: finalQty,
        name: prod.name,
        typeOfPurchase: item.typeOfPurchase,
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
        countInStock: info.countInStock ?? prod.countInStock,
        updatedAt: prod.updatedAt,
      });
    }
    wpUser.cart = updatedCart;
    await wpUser.save();

    // 7b) Map to schema-only orderItems
    order.orderItems = updatedCart.map((it) => ({
      productId: it.productId,
      typeOfPurchase: it.typeOfPurchase,
      quantity: it.quantity,
      price: it.price,
      wpPrice: it.wpPrice,
      unitPrice: it.unitPrice,
      totalPrice: Number(it.quantity) * Number(it.price),
    }));

    // 7c) Recalc totals
    order.itemsPrice = updatedCart.reduce((acc, item) => {
      return acc + Number(item.price) * Number(item.quantity) || 0;
    }, 0);

    order.totalPrice = updatedCart.reduce((acc, item) => {
      return acc + Number(item.price) * Number(item.quantity) || 0;
    }, 0);

    order.status = "In Process";

    await order.save();

    const orderToSend = await Order.findById(order._id);

    const responseOrder = {
      ...orderToSend._doc,
      orderItems: updatedCart.map((it) => ({
        productId: it.productId,
        typeOfPurchase: it.typeOfPurchase,
        quantity: it.quantity,
        price: it.price,
        unitPrice: it.unitPrice,
        wpPrice: it.wpPrice,
        totalPrice: Number(it.quantity) * Number(it.price),
        name: it.name,
        manufacturer: it.manufacturer,
        image: it.image,
        slug: it.slug,
        approved: it.approved,
        productSearchQuery: it.productSearchQuery,
        sentOverNight: it.sentOverNight,
        noExpirationDate: it.noExpirationDate,
        heldStock: it.heldStock,
        quickBooksItemIdProduction: it.quickBooksItemIdProduction,
        minSalePrice: it.minSalePrice,
        countInStock: it.countInStock,
        description: it.description,
        updatedAt: it.updatedAt,
        status: "In Process",
      })),
    };

    // And then:
    return res.status(200).json({ order: responseOrder, wpUser, warnings });
  } catch (err) {
    console.error("❌ fetchOrLatestInProcess:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
