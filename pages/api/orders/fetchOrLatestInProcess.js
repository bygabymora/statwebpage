// pages/api/orders/fetchOrLatestInProcess.js
import db from "../../../utils/db";
import Order from "../../../models/Order";
import WpUser from "../../../models/WpUser";
import Product from "../../../models/Product";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // 1) Connect & authenticate
    await db.connect();
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
      order = new Order({
        wpUser: { userId, name: token.name, email: token.email },
        orderItems: [],
        shippingAddress: {},
        paymentMethod: "",
        itemsPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: 0,
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

      const available = info.quickBooksQuantityOnHandProduction > 0 || 0;

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
        quickBooksQuantityOnHandProduction:
          info.quickBooksQuantityOnHandProduction,
        description: info.description ?? prod.description,
        price: info.wpPrice ?? info.price ?? prod.price,
        countInStock:
          info.quickBooksQuantityOnHandProduction ?? prod.countInStock,
        updatedAt: prod.updatedAt,
      });
    }

    // 7) Persist minimal fields back to DB

    // 7a) Save enriched cart to WP user
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
    order.itemsPrice =
      order.orderItems.reduce((sum, i) => sum + i.totalPrice, 0) || 0;

    order.totalPrice = order.itemsPrice || 0;

    await order.save();

    // 8) Build a plain-JS responseOrder with full enrichment
    const responseOrder = order.toObject();
    responseOrder.orderItems = updatedCart.map((it) => ({
      ...it,
      totalPrice: Number(it.quantity) * Number(it.price),
    }));

    // 9) Return enriched response + warnings
    return res.status(200).json({
      order: responseOrder,
      wpUser,
      warnings,
    });
  } catch (err) {
    console.error("❌ fetchOrLatestInProcess:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await db.disconnect();
  }
}
