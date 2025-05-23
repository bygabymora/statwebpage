import { getToken } from "next-auth/jwt";
import Order from "../../../models/Order";
import db from "../../../utils/db";

const handler = async (req, res) => {
  const WpUser = await getToken({ req });
  if (!WpUser) {
    return res.status(401).send({ message: "signin required" });
  }
  await db.connect(true);
  const lastOrder = await Order.findOne({ WpUser: WpUser._id }).sort({
    createdAt: -1,
  });

  if (lastOrder) {
    res.send(lastOrder);
  } else {
    res.status(200).send({ message: "No orders found", warning: true });
  }
};

export default handler;
