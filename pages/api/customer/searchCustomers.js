import mongoose from "mongoose";
import db from "../../../utils/db";
import Customer from "../../../models/Customer";

export default async function handler(req, res) {
  try {
    await db.connect(true);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    return res
      .status(503)
      .json({ message: "Service unavailable: Database connection failed" });
  }

  const keywordRaw = req.query.keyword?.trim();
  const showInactive = req.query.showInactive === "true";
  const limit = parseInt(req.query.limit) || 20;

  try {
    // If keywordRaw is a valid ObjectId, perform an exact lookup.
    if (keywordRaw && mongoose.Types.ObjectId.isValid(keywordRaw)) {
      const customer = await Customer.findById(keywordRaw);
      if (customer) {
        return res.status(200).json({
          data: [customer],
          totalCount: 1,
          totalPages: 1,
          currentPage: 1,
        });
      }
    }

    let customers = [];

    if (keywordRaw) {
      const keyword = keywordRaw.replace(/\s+/g, " ").trim(); // Normalize spaces

      // Step 1: Exact Match in Company Name
      customers = await Customer.find({
        companyName: { $regex: new RegExp(`^${keyword}$`, "i") },
        ...(showInactive ? {} : { active: true }),
      }).limit(limit);

      // Step 2: Use Text Search If No Exact Match Found
      if (customers.length === 0) {
        customers = await Customer.find(
          { $text: { $search: `"${keyword}"` } },
          { score: { $meta: "textScore" } }
        )
          .sort({ score: { $meta: "textScore" } })
          .limit(limit);
      }

      // Step 3: Fallback to More Flexible Regex if Still No Results
      if (customers.length === 0) {
        const regex = new RegExp(keyword.split(" ").join(".*"), "i");
        customers = await Customer.find({
          $or: [{ companyName: regex }, { aka: regex }, { notes: regex }],
          ...(showInactive ? {} : { active: true }),
        }).limit(limit);
      }
    } else {
      customers = await Customer.find(
        showInactive ? {} : { active: true }
      ).limit(limit);
    }

    res.status(200).json({
      data: customers,
      totalCount: customers.length,
      totalPages: Math.ceil(customers.length / limit),
      currentPage: 1,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res
      .status(500)
      .json({ message: "Error fetching customers", error: error.message });
  }
}
