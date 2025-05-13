import { getToken } from "next-auth/jwt";
import db from "../../../../utils/db";
import Estimate from "../../../../models/Estimate";
import Invoice from "../../../../models/Invoice";

const handler = async (req, res) => {
  const wpUsers = await getToken({ req });
  if (!wpUsers) {
    return res.status(401).send("signin required");
  }

  const { id } = req.query;

  await db.connect();

  try {
    const estimate = await Estimate.findById(id);
    let invoice = null;
    if (!estimate) {
      return res.status(404).send("Estimate not found");
    }
    if (estimate.invoice?.invoiceId) {
      invoice = await Invoice.findById(estimate.invoice.invoiceId);
    }
    await db.disconnect();
    res.status(200).send({ estimate, invoice });
  } catch (error) {
    console.error("Error in /api/orders/[id]:", error);
    await db.disconnect();
    res.status(500).send("Internal Server Error");
  }
};

export default handler;
