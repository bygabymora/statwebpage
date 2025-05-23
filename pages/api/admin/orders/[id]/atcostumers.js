import { getToken } from "next-auth/jwt";
import Order from "../../../../../models/Order";
import db from "../../../../../utils/db";

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send("Error: signin required");
  }
  await db.connect(true);

  const order = await Order.findById(req.query.id);

  if (order) {
    order.isAtCostumers = true;
    order.atCostumersDate = Date.now();
    const atCostumersOrder = await order.save();

    res.send({
      message: "Order is registered as at customers",
      order: atCostumersOrder,
    });
  } else {
    res.status(404).send({ message: "Error: order not found" });
  }
};

export default handler;
