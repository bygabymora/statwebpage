import Product from "../../../models/Product";
import WpUser from "../../../models/WpUser";
import db from "../../../utils/db";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(400).json({ message: "Method not allowed" });
  }

  // Connect to MongoDB
  try {
    await db.connect(true);
  } catch (err) {
    return res.status(503).json({
      message: "Service unavailable: Database connection failed",
      err,
    });
  }

  // Retrieve WP user from token (if any)
  const token = await getToken({ req });
  let wpUser = null;
  if (token?._id) {
    wpUser = await WpUser.findById(token._id).lean();
  }
  const loggedIn = Boolean(token);
  const userApproved = Boolean(wpUser && wpUser.approved);
  const userRestricted = Boolean(userApproved && wpUser.restricted);

  try {
    // Fetch approved + active products as plain objects
    let products = await Product.find({ approved: true, active: true }).lean();

    // If not logged in or not approved: minimal info + sort by name A→Z
    if (!loggedIn || !userApproved) {
      const minimal = products.map((p) => {
        const eachStock = p.each?.quickBooksQuantityOnHandProduction || 0;
        const boxStock = p.box?.quickBooksQuantityOnHandProduction || 0;
        const eachPrice = p.each?.wpPrice || 0;
        const boxPrice = p.box?.wpPrice || 0;

        const hasStock = eachStock > 0 || boxStock > 0;
        const hasPrice = eachPrice > 0 || boxPrice > 0;
        // Rank products based on stock and price availability
        // 0: has both stock and price, 1: has price only,
        // 2: has stock only, 3: has neither
        // This allows us to sort products by priority
        let rank = 3;
        if (hasPrice && hasStock) rank = 0;
        else if (hasPrice) rank = 1;
        else if (hasStock) rank = 2;

        return {
          name: p.name,
          _id: p._id,
          manufacturer: p.manufacturer,
          image: p.image,
          sentOvernigth: p.sentOvernigth,
          each: {
            description: p.each?.description || null,
            minSalePrice: p.each?.minSalePrice || null,
            wpPrice: eachPrice,
            quickBooksQuantityOnHandProduction: eachStock,
          },
          box: {
            description: p.box?.description || null,
            minSalePrice: p.box?.minSalePrice || null,
            wpPrice: boxPrice,
            quickBooksQuantityOnHandProduction: boxStock,
          },
          hasStock,
          hasPrice,
          rank,
        };
      });

      minimal.sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        return a.name.localeCompare(b.name);
      });

      return res.status(200).json(minimal);
    }

    // Logged in & approved → full info sorted by stock, price, name
    products.sort((a, b) => {
      const aInStock =
        (a.each?.quickBooksQuantityOnHandProduction || 0) > 0 ||
        (a.box?.quickBooksQuantityOnHandProduction || 0) > 0;
      const bInStock =
        (b.each?.quickBooksQuantityOnHandProduction || 0) > 0 ||
        (b.box?.quickBooksQuantityOnHandProduction || 0) > 0;
      if (aInStock && !bInStock) return -1;
      if (!aInStock && bInStock) return 1;

      const aHasPrice = (a.each?.wpPrice || 0) > 0 || (a.box?.wpPrice || 0) > 0;
      const bHasPrice = (b.each?.wpPrice || 0) > 0 || (b.box?.wpPrice || 0) > 0;
      if (aHasPrice && !bHasPrice) return -1;
      if (!aHasPrice && bHasPrice) return 1;
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

    // Map full info, zeroing out on-hand counts for restricted users on protected products
    const full = products.map((p) => {
      if (userRestricted && p.protected) {
        return {
          ...p,
          each: p.each
            ? { ...p.each, quickBooksQuantityOnHandProduction: 0 }
            : p.each,
          box: p.box
            ? { ...p.box, quickBooksQuantityOnHandProduction: 0 }
            : p.box,
        };
      }
      return p;
    });

    return res.status(200).json(full);
  } catch (error) {
    console.error("Product fetch error:", error);
    return res.status(500).json({ message: "Error fetching products" });
  }
};

export default handler;
