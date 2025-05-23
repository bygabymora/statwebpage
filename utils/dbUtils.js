import db from "./db"; // Import your existing db connection logic
import { MongoExpiredSessionError } from "mongodb"; // Import the error class

export async function fetchDataWithRetry(fetchFunction, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFunction();
    } catch (error) {
      if (error instanceof MongoExpiredSessionError) {
        console.error("Session expired, reconnecting...");
        await db.connect(true); // Reconnect to MongoDB
      } else {
        throw error; // Rethrow if it's not a session error
      }
    }
  }
}
