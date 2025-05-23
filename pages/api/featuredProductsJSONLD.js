import db from "../../utils/db";
import Product from "../../models/Product";
import { generateProductJSONLD } from "../../utils/seo";

const handleRequest = async (req, res) => {
  try {
    await db.connect(true);
    const products = await Product.find().lean();

    const jsonldData = products.map((product) =>
      generateProductJSONLD(product)
    );

    res.setHeader("Content-Type", "application/ld+json");
    res.status(200).json(jsonldData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products." }, error);
  }
};
export default handleRequest;
