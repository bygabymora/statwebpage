// pages/api/cart/updateProducts.js
import db from "../../../utils/db";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { cartItems } = req.body;
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: "Cart items are required" });
  }

  try {
    await db.connect(true);

    // fetch all products in one go
    const productIds = cartItems.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    const updatedCart = [];
    const warnings = [];

    for (const item of cartItems) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) {
        // no such product → leave it as-is
        updatedCart.push(item);
        continue;
      }

      // pick the correct sub-doc (Each / Box / Clearance)
      const updatedInfo =
        item.typeOfPurchase === "Each"
          ? product.each
          : item.typeOfPurchase === "Box"
          ? product.box
          : item.typeOfPurchase === "Clearance"
          ? product.clearance
          : {};

      // determine available stock
      const available = updatedInfo.countInStock ?? 0;

      // 1) sold-out? → warn & remove
      if (available === 0) {
        warnings.push({
          productId: item.productId,
          typeOfPurchase: item.typeOfPurchase,
          name: product.name,
          previousQuantity: item.quantity,
          availableQuantity: 0,
        });
        continue; // skip pushing this item
      }

      // 2) over-quantity? → cap & warn
      let finalQty = item.quantity;
      if (item.quantity > available) {
        warnings.push({
          productId: item.productId,
          typeOfPurchase: item.typeOfPurchase,
          name: product.name,
          previousQuantity: item.quantity,
          availableQuantity: available,
        });
        finalQty = available;
      }

      // 3) build the enriched cart item
      updatedCart.push({
        ...item,
        quantity: finalQty,
        name: product.name,
        manufacturer: product.manufacturer,
        image: product.image,
        slug: product.slug,
        approved: true,
        productSearchQuery: product.name,
        sentOverNight: product.sentOverNight,
        noExpirationDate: product.noExpirationDate,
        heldStock: product.heldStock,
        quickBooksItemIdProduction:
          updatedInfo.quickBooksItemIdProduction ??
          product.quickBooksItemIdProduction,
        minSalePrice:
          updatedInfo.minSalePrice ?? updatedInfo.price ?? product.minSalePrice,
        countInStock: updatedInfo.countInStock,
        description: updatedInfo.description ?? product.description,
        price: updatedInfo.wpPrice ?? updatedInfo.price ?? product.price,
        updatedAt: product.updatedAt,
      });
    }

    return res.status(200).json({ updatedCart, warnings });
  } catch (error) {
    console.error("Error updating cart products:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
