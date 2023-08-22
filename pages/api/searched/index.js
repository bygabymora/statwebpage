import Searched from '../../../models/Searched';
import db from '../../../utils/db';

const handler = async (req, res) => {
  try {
    await db.connect();

    const newSearched = new Searched({
      ...req.body,
    });

    const searched = await newSearched.save();
    res.status(201).send(searched);
  } catch (error) {
    res.status(500).send({ message: 'Error saving search query.' });
  }
};
export default handler;
