import Product from "../../../../models/Product";
import WpUser from "../../../../models/WpUser";
import db from "../../../../utils/db";
import { getToken } from "next-auth/jwt";

// API route: GET /api/products/[id]
export default async function handler(req, res) {
  // Allow only GET
  if (req.method !== "GET") {
    return res.status(400).json({ message: "Method not allowed" });
  }

  // Connect to MongoDB
  try {
    await db.connect(true);
  } catch (err) {
    return res.status(503).json({
      message: "Service unavailable: Database connection failed",
      error: err,
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
    // Fetch the product by ID
    const p = await Product.findById(req.query.id).lean();
    if (!p) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If not logged in or not approved: return minimal info
    if (!loggedIn || !userApproved) {
      const minimal = {
        name: p.name,
        _id: p._id,
        manufacturer: p.manufacturer,
        image: p.image,
        sentOvernight: p.sentOvernight,
        each: {
          description: p.each?.description || null,
          minSalePrice: p.each?.minSalePrice || null,
          wpPrice: p.each?.wpPrice || null,
        },
        box: {
          description: p.box?.description || null,
          minSalePrice: p.box?.minSalePrice || null,
          wpPrice: p.box?.wpPrice || null,
        },
      };
      return res.status(200).json(minimal);
    }

    // Logged in & approved: full info with stock/price restrictions if needed
    let result = p;
    if (userRestricted && p.protected) {
      result = {
        ...p,
        each: p.each
          ? { ...p.each, quickBooksQuantityOnHandProduction: 0 }
          : p.each,
        box: p.box
          ? { ...p.box, quickBooksQuantityOnHandProduction: 0 }
          : p.box,
      };
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Product fetch error:", error);
    return res.status(500).json({ message: "Error fetching product" });
  }
}
