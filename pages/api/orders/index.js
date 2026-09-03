// pages/api/orders/index.js

import { getToken } from "next-auth/jwt";
import Order from "../../../models/Order";
import WpUser from "../../../models/WpUser";
import Customer from "../../../models/Customer";
import { determineOrderTaxStatus } from "../../../utils/functions/salesTax";
import db from "../../../utils/db";

export default async function handler(req, res) {
  // 1. Auth
  const user = await getToken({ req });
  if (!user) {
    return res.status(401).send("signin required");
  }

  // 2. Connect to MongoDB
  try {
    await db.connect(true);
  } catch (error) {
    return res.status(503).json({
      message: "Service unavailable: Database connection failed",
      error,
    });
  }

  try {
    if (req.method === "POST") {
      // 3. Parse orderData
      let orderData = req.body.order;
      if (!orderData) {
        return res.status(400).json({ message: "Order payload missing" });
      }
      if (typeof orderData === "string") {
        try {
          orderData = JSON.parse(orderData);
        } catch {
          return res
            .status(400)
            .json({ message: "Invalid JSON in `order` field" });
        }
      }

      // Only fields the checkout is allowed to set; anything else (isPaid,
      // paymentResult, docNumber, wpUser...) is server-owned.
      const ALLOWED_ORDER_FIELDS = [
        "orderItems",
        "shippingAddress",
        "billingAddress",
        "shippingPreferences",
        "paymentMethod",
        "poNumber",
        "fileId",
        "fileName",
        "defaultTerm",
        "itemsPrice",
        "totalPrice",
        "discountAmount",
        "status",
      ];

      const sanitizedOrder = {};
      for (const field of ALLOWED_ORDER_FIELDS) {
        if (orderData[field] !== undefined) {
          sanitizedOrder[field] = orderData[field];
        }
      }

      let order = null;

      // Never trust the client's tax flag -- re-derive it from the customer's
      // exemption status and the shipping state.
      const wpUser = await WpUser.findById(user._id)
        .select("customerId firstName lastName email")
        .lean();
      const customer =
        wpUser?.customerId ?
          await Customer.findById(wpUser.customerId).select("taxable").lean()
        : null;

      const taxStatus = determineOrderTaxStatus({
        orderItems: sanitizedOrder.orderItems,
        shippingAddress: sanitizedOrder.shippingAddress,
        customer,
      });

      sanitizedOrder.tax = {
        pending: taxStatus.pending,
        state: taxStatus.state,
        hasAgency: taxStatus.hasAgency,
        customerTaxable: taxStatus.customerTaxable,
        taxableItemCount: taxStatus.taxableItemCount,
        unclassifiedItemCount: taxStatus.unclassifiedItemCount,
        shippingTaxTreatment: taxStatus.shippingTaxTreatment,
        determinedAt: new Date(),
      };

      if (Array.isArray(sanitizedOrder.orderItems)) {
        sanitizedOrder.orderItems = sanitizedOrder.orderItems.map(
          (item, index) => ({
            ...item,
            taxTreatment: taxStatus.items[index]?.taxTreatment,
          }),
        );
      }

      // 4. Update existing order if _id provided
      if (orderData._id) {
        const existing = await Order.findById(orderData._id)
          .select("wpUser")
          .lean();
        if (!existing) {
          return res.status(404).json({ message: "Order not found" });
        }
        if (String(existing.wpUser?.userId) !== String(user._id)) {
          return res.status(403).json({ message: "Forbidden" });
        }

        // ===== replaced find+set+save with atomic findByIdAndUpdate =====
        order = await Order.findByIdAndUpdate(orderData._id, sanitizedOrder, {
          new: true, // return the updated doc
          runValidators: true, // enforce your schema rules
        });
      }

      // 5. Create new order if no update happened
      if (!order) {
        const [last] = await Order.aggregate([
          { $project: { docNumber: 1, num: { $toInt: "$docNumber" } } },
          { $sort: { num: -1 } },
          { $limit: 1 },
        ]);
        const lastNumber = last?.num ?? 0;
        const nextDocNumber = (lastNumber + 1).toString();

        const newOrder = new Order({
          ...sanitizedOrder,
          wpUser: {
            userId: user._id,
            firstName: wpUser?.firstName,
            lastName: wpUser?.lastName,
            email: wpUser?.email,
          },
          docNumber: nextDocNumber,
        });
        order = await newOrder.save();
      }

      return res.status(201).json({ order });
    }

    // 6. Method Not Allowed
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error in /api/orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    // 7. Always disconnect
  }
}
