import { getToken } from "next-auth/jwt";
import Customer from "../../../../models/Customer";
import db from "../../../../utils/db";
import mongoose from "mongoose";

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user) return res.status(401).send("signin required");

  if (req.method === "PUT") return putHandler(req, res);

  return res.status(405).json({ message: "Method not allowed" });
};

const putHandler = async (req, res) => {
  try {
    await db.connect(true);

    const { id } = req.query;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid customer id" });
    }

    const { customer } = req.body || {};
    if (!customer) {
      return res.status(400).json({ message: "Missing customer payload" });
    }

    const customerInDB = await Customer.findById(id);
    if (!customerInDB) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (customer.billAddr) {
      customerInDB.billAddr = {
        ...(customerInDB.billAddr || {}),
        ...customer.billAddr,
      };
    }
    if (customer.location) {
      customerInDB.location = {
        ...(customerInDB.location || {}),
        ...customer.location,
      };
    }
    if (Array.isArray(customer.purchaseExecutive)) {
      customerInDB.purchaseExecutive = customer.purchaseExecutive;
    }
    if (customer.fedexAccountNumber !== undefined) {
      customerInDB.fedexAccountNumber = customer.fedexAccountNumber;
    }
    if (customer.upsAccountNumber !== undefined) {
      customerInDB.upsAccountNumber = customer.upsAccountNumber;
    }

    await customerInDB.save();
    return res.status(200).json({
      message: "Customer updated successfully",
      customer: customerInDB,
    });
  } catch (err) {
    console.error("updateAddresses error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
