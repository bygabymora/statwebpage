import { getToken } from "next-auth/jwt";
import Customer from "../../../../models/Customer";
import db from "../../../../utils/db";

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user) {
    return res.status(401).send("signin required");
  }

  if (req.method === "PUT") {
    return putHandler(req, res);
  } else {
    return res.status(400).send({ message: "Method not allowed" });
  }
};

const putHandler = async (req, res) => {
  await db.connect(true);
  const customerInDB = await Customer.findById(req.query.id);
  const { customer } = req.body;
  if (customerInDB) {
    customerInDB.billAddr = customer.billAddr
      ? customer.billAddr
      : customerInDB.billAddr || {};
    customerInDB.location = customer.location
      ? customer.location
      : customerInDB.location || {};
    customerInDB.purchaseExecutive = customer.purchaseExecutive;
    customerInDB.fedexAccountNumber = customer.fedexAccountNumber;
    customerInDB.upsAccountNumber = customer.upsAccountNumber;
    await customerInDB.save();

    res.send({ message: "News updated successfully" });
  } else {
    res.status(404).send({ message: "News not found" });
  }
};

export default handler;
