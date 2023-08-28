import db from '../../utils/db';
import Product from '../../models/Product';

const handler = async (req, res) => {
  await db.connect();

  try {
    const clearanceProducts = await Product.find({
      isInClearance: true,
    }).lean();
    const hasClearanceProducts = clearanceProducts.length > 0;

    res.status(200).json({ hasClearanceProducts });
  } catch (error) {
    console.error('Failed to fetch clearance products:', error);
    res.status(500).json({ error: 'Failed to fetch clearance products' });
  } finally {
    await db.disconnect();
  }
};

export default handler;
