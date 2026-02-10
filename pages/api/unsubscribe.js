import Customer from "../../models/Customer";
import db from "../../utils/db";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { action, query, customerId } = req.body || {};

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
      }).select("companyName email opOutEmail");

      if (!customer) {
        return res.status(404).json({ message: "Subscriber not found" });
      }

      return res.status(200).json({
        match: {
          _id: customer._id,
          companyName: customer.companyName,
          email: customer.email || customer?.user?.email,
          opOutEmail: customer.opOutEmail,
        },
      });
    }

    if (action === "unsubscribe") {
      if (!customerId) {
        return res.status(400).json({ message: "Missing customerId" });
      }

      const customer = await Customer.findById(customerId).select(
        "companyName email opOutEmail",
      );

      if (!customer) {
        return res.status(404).json({ message: "Subscriber not found" });
      }

      if (!customer.opOutEmail) {
        customer.opOutEmail = true;
        await customer.save();

        // Send confirmation email to the user
        try {
          const customerContact = {
            name: customer.companyName || "",
            companyName: customer.companyName || "",
            email: customer.email,
            _id: customer._id,
          };

          // Send confirmation email to customer
          const confirmationMessage = messageManagement(
            customerContact,
            "Unsubscribe",
            null,
            null,
            null,
            null,
          );

          await handleSendEmails(confirmationMessage, customerContact);

          // Send notification email to admins
          const adminEmails = [
            "sales@statsurgicalsupply.com",
            "sofi@statsurgicalsupply.com",
            "gaby@statsurgicalsupply.com",
          ];

          const notificationMessage = messageManagement(
            customerContact, // Use customer data for the notification content
            "Unsubscribe Notification",
            null,
            null,
            null,
            null,
          );

          // Send notification to each admin
          for (const adminEmail of adminEmails) {
            const adminContact = { email: adminEmail };
            await handleSendEmails(notificationMessage, adminContact);
          }

          console.log(
            "Unsubscribe emails sent successfully for:",
            customer.email,
          );
        } catch (emailError) {
          console.error("Failed to send unsubscribe emails:", emailError);
          // Don't fail the unsubscribe process if email fails
        }
      }

      return res.status(200).json({
        message:
          customer.opOutEmail ?
            "Unsubscribed successfully"
          : "Unsubscribe updated",
        customerId: customer._id,
      });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("unsubscribe error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
