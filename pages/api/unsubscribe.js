import Customer from "../../models/Customer";
import db from "../../utils/db";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { mailChimpId, mailChimpUniqueEmailId } = req.body || {};
  if (!mailChimpId || !mailChimpUniqueEmailId) {
    return res.status(400).json({
      message: "Missing mailChimpId or mailChimpUniqueEmailId",
    });
  }

  try {
    await db.connect(true);

    const topLevelCustomer = await Customer.findOneAndUpdate(
      { mailChimpId, mailChimpUniqueEmailId },
      { $set: { opOutEmail: true } },
      { new: true },
    );

    if (topLevelCustomer) {
      return res.status(200).json({
        message: "Unsubscribed successfully",
        customerId: topLevelCustomer._id,
        scope: "customer",
      });
    }

    const nestedCustomer = await Customer.findOneAndUpdate(
      {
        "purchaseExecutive.mailChimpId": mailChimpId,
        "purchaseExecutive.mailChimpUniqueEmailId": mailChimpUniqueEmailId,
      },
      { $set: { "purchaseExecutive.$.opOutEmail": true } },
      { new: true },
    );

    if (!nestedCustomer) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    return res.status(200).json({
      message: "Unsubscribed successfully",
      customerId: nestedCustomer._id,
      scope: "purchaseExecutive",
    });
  } catch (error) {
    console.error("unsubscribe error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
