import { getToken } from "next-auth/jwt";
import db from "../../../../utils/db";
import Customer from "../../../../models/Customer";

export default async function handler(req, res) {
  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.toString) return value.toString();
    return String(value);
  };

  const token = await getToken({ req });
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ message: "Missing customer ID" });

  await db.connect(true);

  const customer = await Customer.findById(id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  if (req.method === "POST") {
    const { productId, name, manufacturer, image } = req.body;
    if (!productId && !name) {
      return res.status(400).json({ message: "Missing productId or name" });
    }

    const normalizedIncomingId = normalizeId(productId);
    const normalizedIncomingName = String(name || "")
      .trim()
      .toLowerCase();
    const normalizedIncomingManufacturer = String(manufacturer || "")
      .trim()
      .toLowerCase();

    const alreadyExists = customer.wishlist.some(
      (w) =>
        (normalizedIncomingId &&
          normalizeId(w.productId) === normalizedIncomingId) ||
        (!normalizedIncomingId &&
          String(w.name || "")
            .trim()
            .toLowerCase() === normalizedIncomingName &&
          String(w.manufacturer || "")
            .trim()
            .toLowerCase() === normalizedIncomingManufacturer),
    );
    if (alreadyExists) {
      return res.status(200).json({ wishlist: customer.wishlist });
    }

    customer.wishlist.push({
      productId,
      name,
      manufacturer,
      image,
      addedAt: new Date(),
    });

    await customer.save();
    return res.status(200).json({ wishlist: customer.wishlist });
  }

  if (req.method === "DELETE") {
    const { productId, itemId, name, manufacturer, addedAt } = req.body;
    if (!productId && !itemId && !name) {
      return res
        .status(400)
        .json({ message: "Missing productId or fallback item fields" });
    }

    const normalizedIncomingId = normalizeId(productId);
    const normalizedItemId = normalizeId(itemId);
    const normalizedName = String(name || "")
      .trim()
      .toLowerCase();
    const normalizedManufacturer = String(manufacturer || "")
      .trim()
      .toLowerCase();
    const normalizedAddedAt = addedAt ? new Date(addedAt).getTime() : null;

    const indexToDelete = customer.wishlist.findIndex((w) => {
      const wishlistItemId = normalizeId(w?._id || w?.wishListProductId);

      if (normalizedIncomingId) {
        return normalizeId(w.productId) === normalizedIncomingId;
      }

      if (normalizedItemId) {
        return wishlistItemId === normalizedItemId;
      }

      const sameName =
        String(w.name || "")
          .trim()
          .toLowerCase() === normalizedName;
      const sameManufacturer =
        String(w.manufacturer || "")
          .trim()
          .toLowerCase() === normalizedManufacturer;

      if (!sameName || !sameManufacturer) return false;
      if (!normalizedAddedAt || !w.addedAt) return true;

      return new Date(w.addedAt).getTime() === normalizedAddedAt;
    });

    if (indexToDelete >= 0) {
      customer.wishlist.splice(indexToDelete, 1);
    }

    await customer.save();
    return res.status(200).json({ wishlist: customer.wishlist });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
