import Customer from "../../models/Customer";
import db from "../../utils/db";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import { sendEmailMessage } from "../../utils/alertSystem/sendEmailMessage";
import { escapeHtml } from "../../utils/alertSystem/escapeHtml";
import { RATE_LIMITS, enforceRateLimit } from "../../utils/rateLimit";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { action, query, customerId, purchaseExecutiveId } = req.body || {};

  // Open to anyone (from email links), so a limited number of lookups and
  // unsubscribes per visitor (IP).
  const rateLimit =
    action === "search" ? RATE_LIMITS.unsubscribeSearch
    : action === "unsubscribe" ? RATE_LIMITS.unsubscribe
    : null;
  if (
    rateLimit &&
    !(await enforceRateLimit(req, res, `unsubscribe:${action}`, rateLimit))
  ) {
    return;
  }

  try {
    await db.connect(true);

    if (action === "search") {
      if (!query || !String(query).trim()) {
        return res.status(400).json({ message: "Missing search query" });
      }

      const normalizedQuery = String(query).trim();
      const escapedQuery = normalizedQuery.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      const isEmail = normalizedQuery.includes("@");

      const emailMatch = { $regex: `^${escapedQuery}$`, $options: "i" };
      const companyMatch = { $regex: escapedQuery, $options: "i" };

      const customer = await Customer.findOne({
        $or:
          isEmail ?
            [
              { email: emailMatch },
              { secondEmail: emailMatch },
              { "user.email": emailMatch },
              { "purchaseExecutive.email": emailMatch },
            ]
          : [
              { companyName: companyMatch },
              { email: emailMatch },
              { secondEmail: emailMatch },
              { "user.email": emailMatch },
            ],
      }).select("companyName email opOutEmail purchaseExecutive user");

      if (!customer) {
        return res.status(404).json({ message: "Subscriber not found" });
      }

      // Check if search was for a purchase executive email
      let purchaseExecutive = null;
      if (isEmail) {
        purchaseExecutive = customer.purchaseExecutive?.find(
          (pe) =>
            pe.email &&
            pe.email.toLowerCase() === normalizedQuery.toLowerCase(),
        );
      }

      return res.status(200).json({
        match: {
          _id: customer._id,
          companyName: customer.companyName,
          email: customer.email || customer?.user?.email,
          opOutEmail: customer.opOutEmail,
          purchaseExecutive: purchaseExecutive || null,
          isPurchaseExecutive: !!purchaseExecutive,
        },
      });
    }

    if (action === "unsubscribe") {
      if (!customerId) {
        return res.status(400).json({ message: "Missing customerId" });
      }

      const customer = await Customer.findById(customerId).select(
        "companyName email opOutEmail purchaseExecutive",
      );

      if (!customer) {
        return res.status(404).json({ message: "Subscriber not found" });
      }

      let unsubscribedContact = null;
      let isMainCustomer = true;

      // If unsubscribing a specific purchase executive
      if (purchaseExecutiveId) {
        const purchaseExecutive = customer.purchaseExecutive?.find(
          (pe) => pe._id.toString() === purchaseExecutiveId,
        );

        if (!purchaseExecutive) {
          return res
            .status(404)
            .json({ message: "Purchase executive not found" });
        }

        if (!purchaseExecutive.opOutEmail) {
          purchaseExecutive.opOutEmail = true;
          await customer.save();
        }

        unsubscribedContact = {
          name: `${purchaseExecutive.name} ${purchaseExecutive.lastName || ""}`.trim(),
          email: purchaseExecutive.email,
          role: purchaseExecutive.role || purchaseExecutive.title,
          companyName: customer.companyName,
        };
        isMainCustomer = false;
      } else {
        // Unsubscribe main customer
        if (!customer.opOutEmail) {
          customer.opOutEmail = true;
          await customer.save();
        }

        unsubscribedContact = {
          name: customer.companyName || "",
          email: customer.email,
          companyName: customer.companyName,
        };
      }

      // Names come from the customer record, so escape them for the HTML.
      const customerContact = {
        name: escapeHtml(unsubscribedContact.name),
        companyName: escapeHtml(unsubscribedContact.companyName),
        email: unsubscribedContact.email,
        _id: customer._id,
      };

      // Each email is sent on its own, so a failed confirmation never stops
      // the admins from hearing about the unsubscribe. Neither failure fails
      // the unsubscribe itself.
      try {
        // The same confirmation fits a main customer and a purchase executive.
        const confirmationMessage = messageManagement(
          customerContact,
          "Unsubscribe",
          null,
          null,
          null,
          null,
        );
        await sendEmailMessage(confirmationMessage, customerContact);
      } catch (emailError) {
        console.error("Failed to send unsubscribe confirmation:", emailError);
      }

      try {
        const notificationMessage = messageManagement(
          customerContact, // Use customer data for the notification content
          "Unsubscribe Notification",
          null,
          null,
          null,
          null,
        );

        // Notify the admins. Every email is also BCC'd to gaby@ and sofi@
        // (see sendTransactionalEmail), so one send reaches all three.
        await sendEmailMessage(notificationMessage, {
          email: "sales@statsurgicalsupply.com",
        });
      } catch (emailError) {
        console.error("Failed to send unsubscribe notification:", emailError);
      }

      return res.status(200).json({
        message:
          (
            isMainCustomer ? customer.opOutEmail : unsubscribedContact
          ) ?
            "Unsubscribed successfully"
          : "Unsubscribe updated",
        customerId: customer._id,
        isMainCustomer,
        unsubscribedContact,
      });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("unsubscribe error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
