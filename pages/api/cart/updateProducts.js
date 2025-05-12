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
    await db.connect();

    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    const updatedCart = cartItems.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (!product) return item; // If product is missing, fallback to original item

      const updatedInfo =
        item.typeOfPurchase === "Each"
          ? product.each
          : item.typeOfPurchase === "Box"
          ? product.box
          : item.typeOfPurchase === "Clearance"
          ? product.clearance
          : {};

      return {
        ...item,
        name: product.name,
        manufacturer: product.manufacturer,
        image: product.image,
        slug: product.slug,
        quickBooksQuantityOnHandProduction:
          updatedInfo?.quickBooksQuantityOnHandProduction,
        description:
          updatedInfo?.description || product.description || item.description,
        price:
          updatedInfo?.wpPrice ||
          updatedInfo?.price ||
          product.price ||
          item.price,
        countInStock:
          updatedInfo?.quickBooksQuantityOnHandProduction ||
          updatedInfo?.countInStock ||
          item.countInStock,
        updatedAt: product.updatedAt,
      };
    });

    return res.status(200).json({ updatedCart });
  } catch (error) {
    console.error("Error updating cart products:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
