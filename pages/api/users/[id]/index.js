// pages/api/wp-users/[id].js
import { getToken } from "next-auth/jwt";
import WpUser from "../../../../models/WpUser";
import db from "../../../../utils/db";
import Customer from "../../../../models/Customer";
import User from "../../../../models/User";

const handler = async (req, res) => {
  // 1. Auth check
  const authUser = await getToken({ req });
  if (!authUser) {
    return res.status(401).send("Login required");
  }

  // 2. Only GET allowed
  if (req.method !== "GET") {
    return res.status(400).send({ message: "Method not allowed" });
  }

  try {
    await db.connect();

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Missing user ID" });
    }
    console.log("Fetching WpUser id:", id);

    // 3. Fetch the WpUser record
    const wpUser = await WpUser.findById(id);
    if (!wpUser) {
      await db.disconnect();
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

        console.log("ownerUser", ownerUser);
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

    await db.disconnect();
    return res.status(200).json({ wpUser, customer, accountOwner });
  } catch (error) {
    console.error(error);
    await db.disconnect();
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default handler;
