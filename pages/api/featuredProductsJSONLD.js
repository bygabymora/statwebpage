import db from "../../utils/db";
import Product from "../../models/Product";
import { generateProductJSONLD } from "../../utils/seo";
import { withAvailableStock } from "../../utils/functions/stock";

const handleRequest = async (req, res) => {
  try {
    await db.connect(true);
    const products = await Product.find().lean();

    const jsonldData = products.map((product) =>
      generateProductJSONLD({
        ...product,
        each: withAvailableStock(product.each),
        box: withAvailableStock(product.box),
        loose: withAvailableStock(product.loose),
      }),
    );

    res.setHeader("Content-Type", "application/ld+json");
    res.status(200).json(jsonldData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products." }, error);
  }
};
export default handleRequest;
