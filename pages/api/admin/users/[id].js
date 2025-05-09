import WpUser from "../../../../models/WpUser";
import Customer from "../../../../models/Customer";
import db from "../../../../utils/db";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || !user.isAdmin) {
    return res
      .status(401)
      .json({ type: "error", message: "Login required as an admin" });
  }

  if (req.method === "GET") {
    return getHandler(req, res);
  } else if (req.method === "PUT") {
    return putHandler(req, res);
  } else if (req.method === "DELETE") {
    return deleteHandler(req, res);
  } else {
    return res
      .status(400)
      .json({ type: "error", message: "Method not allowed" });
  }
};

const getHandler = async (req, res) => {
  await db.connect();
  try {
    const user = await WpUser.findById(req.query.id);
    if (!user) {
      return res.status(404).json({ type: "error", message: "User not found" });
    }
    let customer = null;
    if (user.customerId) {
      customer = await Customer.findById(user.customerId);
    }
    return res.json({ type: "success", user, customer });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json({ type: "error", message: "Error fetching user" });
  } finally {
    await db.disconnect();
  }
};

const putHandler = async (req, res) => {
  await db.connect();
  try {
    const userInDB = await WpUser.findById(req.query.id);
    if (!userInDB) {
      return res.status(404).json({ type: "error", message: "User not found" });
    }
    const { user, customer } = req.body;
    let customerInDB = null;
    if (customer) {
      customerInDB = await Customer.findById(customer._id);
      if (!customerInDB) {
        return res
          .status(404)
          .json({ type: "error", message: "Customer not found" });
      }
      customerInDB.purchaseExecutive = customer.purchaseExecutive;
      await customerInDB.save();
    }
    userInDB.name = user.name ?? user.name;
    userInDB.firstName = user.firstName ?? user.firstName;
    userInDB.lastName = user.lastName ?? user.lastName;
    userInDB.email = user.email ?? user.email;
    userInDB.customerId = user.customerId ?? user.customerId;
    userInDB.isAdmin =
      user.isAdmin !== undefined ? Boolean(user.isAdmin) : user.isAdmin;
    userInDB.active =
      user.active !== undefined ? Boolean(user.active) : user.active;
    userInDB.approved =
      user.approved !== undefined ? Boolean(user.approved) : user.approved;
    if (typeof user.restricted === "boolean") {
      userInDB.restricted = user.restricted;
    }

    await userInDB.save();
    return res.json({ type: "success", message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json({ type: "error", message: "Error updating user" });
  } finally {
    await db.disconnect();
  }
};

const deleteHandler = async (req, res) => {
  await db.connect();
  try {
    const user = await WpUser.findById(req.query.id);
    if (!user) {
      return res.status(404).json({ type: "error", message: "User not found" });
    }

    if (user.isAdmin) {
      return res
        .status(400)
        .json({ type: "error", message: "Cannot delete admin" });
    }

    await WpUser.findByIdAndDelete(req.query.id);
    return res.json({ type: "success", message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json({ type: "error", message: "Error deleting user" });
  } finally {
    await db.disconnect();
  }
};

export default handler;
