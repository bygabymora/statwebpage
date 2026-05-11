import mongoose from "mongoose";
import db from "../../../utils/db";
import Customer from "../../../models/Customer";

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildExactMatchQuery(keyword) {
  const escapedKeyword = escapeRegex(keyword);
  const exactRegex = new RegExp(`^${escapedKeyword}$`, "i");
  const baseQuery = [
    { companyName: exactRegex },
    { aka: exactRegex },
    { email: exactRegex },
    { secondEmail: exactRegex },
    { "user.name": exactRegex },
    { "user.email": exactRegex },
    { "purchaseExecutive.email": exactRegex },
    { "purchaseExecutive.name": exactRegex },
    { "purchaseExecutive.lastName": exactRegex },
  ];

  const parts = keyword.split(" ").filter(Boolean);
  if (parts.length > 1) {
    const [firstName, ...rest] = parts;
    const lastName = rest.join(" ");
    baseQuery.push({
      purchaseExecutive: {
        $elemMatch: {
          name: new RegExp(`^${escapeRegex(firstName)}$`, "i"),
          lastName: new RegExp(`^${escapeRegex(lastName)}$`, "i"),
        },
      },
    });
  }

  return { $or: baseQuery };
}

function buildFlexibleMatchQuery(keyword) {
  const flexibleRegex = new RegExp(
    keyword.split(" ").map(escapeRegex).join(".*"),
    "i",
  );

  return {
    $or: [
      { companyName: flexibleRegex },
      { aka: flexibleRegex },
      { notes: flexibleRegex },
      { email: flexibleRegex },
      { secondEmail: flexibleRegex },
      { "user.name": flexibleRegex },
      { "user.email": flexibleRegex },
      { "purchaseExecutive.email": flexibleRegex },
      { "purchaseExecutive.name": flexibleRegex },
      { "purchaseExecutive.lastName": flexibleRegex },
    ],
  };
}

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

      // Step 1: Exact Match in company or contact fields
      customers = await Customer.find({
        ...buildExactMatchQuery(keyword),
        ...(showInactive ? {} : { active: true }),
      }).limit(limit);

      // Step 2: Use Text Search If No Exact Match Found
      if (customers.length === 0) {
        customers = await Customer.find(
          { $text: { $search: `"${keyword}"` } },
          { score: { $meta: "textScore" } },
        )
          .sort({ score: { $meta: "textScore" } })
          .limit(limit);
      }

      // Step 3: Fallback to More Flexible Regex if Still No Results
      if (customers.length === 0) {
        customers = await Customer.find({
          ...buildFlexibleMatchQuery(keyword),
          ...(showInactive ? {} : { active: true }),
        }).limit(limit);
      }
    } else {
      customers = await Customer.find(
        showInactive ? {} : { active: true },
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
