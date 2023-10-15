import { getToken } from 'next-auth/jwt';
import News from '../../../../models/News';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || !user.isAdmin) {
    return res.status(401).send('admin signin required');
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'POST') {
    return postHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const postHandler = async (req, res) => {
  await db.connect();
  const newNews = new News({
    title: 'Sample Title',
    slug: 'sample-title-' + Math.random(),
    content: 'Sample content',
    category: 'Sample category',
    tags: ['tag1', 'tag2'],
    imageUrl:
      'https://res.cloudinary.com/dcjahs0jp/image/upload/v1694037866/arpshiwxqjzhv7edkhuy.png',
    author: 'Sample Author',
    sources: [
      {
        title: 'Sample Source1 title1',
        url: 'https://sampleurl1.com',
      },
      {
        title: 'Sample Source2 title2',
        url: 'https://sampleurl2.com',
      },
    ],
  });

  try {
    const news = await newNews.save();
    await db.disconnect();
    res.status(201).send({ message: 'News created successfully', news });
  } catch (error) {
    await db.disconnect();
    res.status(500).send({ message: 'Error creating News entry', error });
  }
};

const getHandler = async (req, res) => {
  await db.connect();
  const newsEntries = await News.find({});
  await db.disconnect();
  res.send(newsEntries);
};

export default handler;
