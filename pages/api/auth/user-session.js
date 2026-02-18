import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return res.status(401).json({
        message: "No active session found",
        loggedIn: false,
      });
    }

    // Log the session access (optional - for debugging/monitoring)
    console.log("Session accessed at:", new Date().toISOString());
    console.log("User:", {
      id: token._id,
      email: token.email,
      name: `${token.firstName || ""} ${token.lastName || ""}`.trim(),
      isAdmin: token.isAdmin,
    });

    res.status(200).json({
      loggedIn: true,
      user: {
        id: token._id,
        firstName: token.firstName,
        lastName: token.lastName,
        fullName: `${token.firstName || ""} ${token.lastName || ""}`.trim(),
        email: token.email,
        isAdmin: token.isAdmin,
        companyName: token.companyName,
        companyEinCode: token.companyEinCode,
        active: token.active,
        approved: token.approved,
        restricted: token.restricted,
        picture: token.picture,
        locale: token.locale,
      },
      sessionInfo: {
        expires: token.exp ? new Date(token.exp * 1000).toISOString() : null,
        accessedAt: new Date().toISOString(),
        issuedAt: token.iat ? new Date(token.iat * 1000).toISOString() : null,
      },
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    res.status(500).json({
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
}
