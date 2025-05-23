import db from "../../../utils/db";
import News from "../../../models/News";

const handler = async (req, res) => {
  await db.connect(true);
  const product = await News.findById(req.query.id).lean();

  res.send(product);
};

export default handler;
