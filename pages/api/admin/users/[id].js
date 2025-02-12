import User from '../../../../models/user';
import db from '../../../../utils/db';
import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || !user.isAdmin) {
    return res
      .status(401)
      .send('Login required as an admin');
  }

  if (req.method === 'GET') {
    return getHandler(req, res, user);
  } else if (req.method === 'PUT') {
    return putHandler(req, res, user);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res, user);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  await db.connect();
  const user = await User.findById(req.query.id);
  await db.disconnect();
  res.send(user);
};
  

const putHandler = async (req, res) => {
  await db.connect();
  const user = await User.findById(req.query.id);
  if (user) {
    user.name = req.body.name;
    user.email = req.body.email;
    user.companyName = req.body.companyName;
    user.companyEinCode = req.body.companyEinCode;
    user.isAdmin = Boolean(req.body.isAdmin);
    await user.save();

    await db.disconnect();
    res.send({ message: 'User updated successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Usuario no encontrado' });
  }
};

const deleteHandler = async (req, res) => {
  await db.connect();
  const user = await User.findById(req.query.id);
  if (user) {
    if (user.isAdmin === true) {
      await db.disconnect();
      return res
        .status(400)
        .send({ message: 'Cant delete admin' });
    }
    await User.findByIdAndDelete(req.query.id);
    await db.disconnect();
    res.send({ message: 'User deleted' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'User not found' });
  }
};

export default handler;