import WpUser from '../../models/WpUser';
import db from '../../utils/db';
import data from '../../utils/data';
import Product from '../../models/Product';

const handler = async (req, res) => {
  await db.connect();
  await WpUser.deleteMany();
  await WpUser.insertMany(data.users);
  await Product.deleteMany();
  await Product.insertMany(data.products);
  await db.disconnect();
  res.send({ message: 'seeded successfully' });
};

export default handler;
