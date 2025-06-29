import { getToken } from "next-auth/jwt";
import Order from "../../../../models/Order";
import db from "../../../../utils/db";

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send("signin required");
  }
  if (req.method === "GET") {
    await db.connect(true);
    const orders = await Order.find({})
      .populate("wpUser", "name email")
      .sort({ createdAt: -1 });
    res.send(orders);
  } else {
    return res.status(400).send({ message: "Method not allowed" });
  }
};

export default handler;
