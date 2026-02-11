import { getSession } from "next-auth/react";
import WpUser from "../../../../models/WpUser";
import db from "../../../../utils/db";

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).send("Admin signin required");
  }

  // Prevent caching to ensure fresh data
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  await db.connect(true);

  // Force fresh query with read concern for latest data
  const users = await WpUser.find({})
    .lean() // Better performance
    .read("primary") // Read from primary replica
    .maxTimeMS(10000); // 10 second timeout

  // Debug logging to track data freshness
  console.log(
    `[${new Date().toISOString()}] Fetched ${users.length} users from database`,
  );

  res.send(users);
};

export default handler;
