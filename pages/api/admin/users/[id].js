import WpUser from '../../../../models/WpUser';
import db from '../../../../utils/db';
import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || !user.isAdmin) {
    return res.status(401).json({ type: 'error', message: 'Login required as an admin' });
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'PUT') {
    return putHandler(req, res);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res);
  } else {
    return res.status(400).json({ type: 'error', message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  await db.connect();
  try {
    const user = await WpUser.findById(req.query.id);
    if (!user) {
      return res.status(404).json({ type: 'error', message: 'User not found' });
    }
    return res.json({ type: 'success', user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ type: 'error', message: 'Error fetching user' });
  } finally {
    await db.disconnect();
  }
};

const putHandler = async (req, res) => {
  await db.connect();
  try {
    const user = await WpUser.findById(req.query.id);
    if (!user) {
      return res.status(404).json({ type: 'error', message: 'User not found' });
    }

    user.name = req.body.name ?? user.name;
    user.email = req.body.email ?? user.email;
    user.companyName = req.body.companyName ?? user.companyName;
    user.companyEinCode = req.body.companyEinCode ?? user.companyEinCode;
    user.isAdmin = req.body.isAdmin !== undefined ? Boolean(req.body.isAdmin) : user.isAdmin;
    user.active = req.body.active !== undefined ? Boolean(req.body.active) : user.active;
    user.approved = req.body.approved !== undefined ? Boolean(req.body.approved) : user.approved;

    await user.save();
    return res.json({ type: 'success', message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ type: 'error', message: 'Error updating user' });
  } finally {
    await db.disconnect();
  }
};

const deleteHandler = async (req, res) => {
  await db.connect();
  try {
    const user = await WpUser.findById(req.query.id);
    if (!user) {
      return res.status(404).json({ type: 'error', message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ type: 'error', message: 'Cannot delete admin' });
    }

    await WpUser.findByIdAndDelete(req.query.id);
    return res.json({ type: 'success', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ type: 'error', message: 'Error deleting user' });
  } finally {
    await db.disconnect();
  }
};

export default handler;
