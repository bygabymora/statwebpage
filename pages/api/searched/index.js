import Searched from '../../../models/Searched';
import db from '../../../utils/db';

const handler = async (req, res) => {
  await db.connect();
  const newSearched = new Searched({
    ...req.body,
  });

  const searched = await newSearched.save();
  res.status(201).send(searched);
};
export default handler;
