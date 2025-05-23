import db from "../../../../utils/db";
import Product from "../../../../models/Product";

const handler = async (req, res) => {
  await db.connect(true);
  const product = await Product.findById(req.query.id).lean();
  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }
  res.send(product);
};

export default handler;
