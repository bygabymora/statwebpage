import { getToken } from "next-auth/jwt";
import db from "../../../../utils/db";
import WpUser from "../../../../models/WpUser";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  const token = await getToken({ req });
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  await db.connect(true);

  const user = await WpUser.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  switch (method) {
    case "GET": {
      // Load entire cart
      return res.status(200).json({ cart: user.cart });
    }

    case "POST": {
      // Add or update item in cart
      const { productId, price, wpPrice, quantity, typeOfPurchase, unitPrice } =
        req.body;

      if (!productId || !quantity || !typeOfPurchase) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const index = user.cart.findIndex(
        (item) =>
          item.productId === productId && item.typeOfPurchase === typeOfPurchase
      );

      if (index >= 0) {
        const existingQty = Number(user.cart[index].quantity) || 0;
        const newQty = existingQty + Number(quantity);
        user.cart[index] = {
          ...user.cart[index],
          price,
          wpPrice,
          unitPrice,
          quantity: newQty,
          productId,
          typeOfPurchase,
        };
      } else {
        // Add new item
        user.cart.push({
          productId,
          price,
          wpPrice,
          quantity,
          typeOfPurchase,
          unitPrice,
        });
      }

      await user.save();
      return res.status(200).json({ cart: user.cart });
    }

    case "PUT": {
      // Update quantity or prices for a specific item
      const { productId, quantity, typeOfPurchase, price, wpPrice, unitPrice } =
        req.body;

      const item = user.cart.find(
        (item) =>
          item.productId === productId && item.typeOfPurchase === typeOfPurchase
      );

      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      item.quantity = quantity ?? item.quantity;
      if (price !== undefined) item.price = price;
      if (wpPrice !== undefined) item.wpPrice = wpPrice;
      if (unitPrice !== undefined) item.unitPrice = unitPrice;

      await user.save();
      return res.status(200).json({ cart: user.cart });
    }

    case "DELETE": {
      // Remove item from cart
      const { productId, typeOfPurchase } = req.body;

      user.cart = user.cart.filter(
        (item) =>
          item.productId !== productId || item.typeOfPurchase !== typeOfPurchase
      );

      await user.save();
      return res.status(200).json({ cart: user.cart });
    }

    case "PATCH": {
      // Clear/reset cart
      const { action } = req.body;

      if (action === "reset" || action === "clear") {
        user.cart = [];
        await user.save();
        return res.status(200).json({ cart: [] });
      }

      return res.status(400).json({ message: "Invalid patch action" });
    }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}
