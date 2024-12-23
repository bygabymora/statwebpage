import { getToken } from "next-auth/jwt";

async function fetchData(req) {
  try {
    const token = await getToken({ req });
    const user = token ? token : {}; // Assuming getToken returns null or the user object
    return user;
  } catch (error) {
    throw new Error("Error fetching user data", error);
  }
}

export default async function handler(req, res) {
  try {
    const user = await fetchData(req);
    // Now you can use the user's email or perform other operations

    // Example: Sending the user's email as JSON response
    res.status(200).json({ email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
}
