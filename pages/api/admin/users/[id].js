import WpUser from "../../../../models/WpUser";
import Customer from "../../../../models/Customer";
import db from "../../../../utils/db";
import { getToken } from "next-auth/jwt";
import User from "../../../../models/User";

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
  await db.connect(true);
  try {
    const wpUser = await WpUser.findById(req.query.id);
    if (!wpUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let customer = null;
    let accountOwner = null;

    // 4. If this WpUser links to a Customer → find the actual User
    if (wpUser.customerId) {
      customer = await Customer.findById(wpUser.customerId);

      if (customer?.user?.userId) {
        // 5. Make sure 'charge' is included even if schema has select:false
        const ownerUser = await User.findById(customer.user.userId).lean();
        if (ownerUser) {
          accountOwner = {
            name: ownerUser.name,
            userQuickBooksId: ownerUser.userQuickBooksId,
            email: ownerUser.email,
            phone: ownerUser.phone,
            // JSON.stringify will drop undefined, so we coalesce to null
            charge: ownerUser.charge ?? null,
          };
        }
      }
    }

    return res.status(200).json({ wpUser, customer, accountOwner });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json({ type: "error", message: "Error fetching user" });
  }
};

const putHandler = async (req, res) => {
  try {
    await db.connect(true);

    const userInDB = await WpUser.findById(req.query.id);
    if (!userInDB) {
      return res.status(404).json({ type: "error", message: "User not found" });
    }

    const { user, customer } = req.body;

    // Log the update attempt for debugging
    console.log("Updating user:", {
      userId: req.query.id,
      previousApproved: userInDB.approved,
      newApproved: user.approved,
    });

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

    // Update user fields with explicit field checking
    if ("approvalEmailSent" in user) {
      userInDB.approvalEmailSent = user.approvalEmailSent;
    }
    if ("name" in user) {
      userInDB.name = user.name;
    }
    if ("firstName" in user) {
      userInDB.firstName = user.firstName;
    }
    if ("lastName" in user) {
      userInDB.lastName = user.lastName;
    }
    if ("email" in user) {
      userInDB.email = user.email;
    }
    if ("customerId" in user) {
      userInDB.customerId = user.customerId;
    }
    if ("isAdmin" in user) {
      userInDB.isAdmin = Boolean(user.isAdmin);
    }
    if ("active" in user) {
      userInDB.active = Boolean(user.active);
    }
    if ("approved" in user) {
      userInDB.approved = Boolean(user.approved);
    }
    if ("restricted" in user) {
      userInDB.restricted = Boolean(user.restricted);
    }

    const savedUser = await userInDB.save();

    // Log successful save for debugging
    console.log("User saved successfully:", {
      userId: savedUser._id,
      approved: savedUser.approved,
      active: savedUser.active,
    });

    return res.status(200).json({
      type: "success",
      message: "User updated successfully",
      user: {
        _id: savedUser._id,
        approved: savedUser.approved,
        active: savedUser.active,
        isAdmin: savedUser.isAdmin,
        restricted: savedUser.restricted,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      type: "error",
      message: "Error updating user",
      details: error.message,
    });
  }
};

const deleteHandler = async (req, res) => {
  await db.connect(true);
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
  }
};

export default handler;
