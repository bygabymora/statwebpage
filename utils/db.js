import mongoose from "mongoose";

const connection = { isConnected: false };
let lastActivityTime = null;

/**
 * Updates the last DB activity timestamp.
 */
function updateLastActivityTime() {
  lastActivityTime = Date.now();
}

/**
 * Connects to MongoDB (or reuses a cached connection),
 * and updates the last-activity timestamp.
 * @param {boolean} updateActivity
 * @returns {Promise<mongoose.Mongoose>}
 */
async function connect(updateActivity = true) {
  // If we already have a cached connection, reuse it
  if (global._mongo && global._mongo.conn) {
    connection.isConnected = true;
    if (updateActivity) updateLastActivityTime();
    return global._mongo.conn;
  }
  // Initialize the cache container if needed
  if (!global._mongo) {
    global._mongo = { conn: null, promise: null };
  }
  // If no connection attempt in flight, start one
  if (!global._mongo.promise) {
    global._mongo.promise = mongoose
      .connect(process.env.MONGODB_URI_FINAL, {
        maxPoolSize: 10, // adjust per workload
        minPoolSize: 0, // allow pool to shrink when idle
        socketTimeoutMS: 5 * 60 * 1000,
        serverSelectionTimeoutMS: 30 * 1000,
      })
      .then((mongo) => {
        global._mongo.conn = mongo;
        connection.isConnected = true;
        return mongo;
      });
  }
  // Await the connection promise
  const db = await global._mongo.promise;
  if (updateActivity) updateLastActivityTime();
  return db;
}

/**
 * If >5 min idle since lastActivityTime, disconnect and clear.
 */
async function checkAndDisconnect() {
  if (lastActivityTime && Date.now() - lastActivityTime > 5 * 60 * 1000) {
    await disconnect();
  }
}

/**
 * Immediately closes the mongoose connection.
 */
async function disconnect() {
  if (connection.isConnected) {
    await mongoose.disconnect();
    connection.isConnected = false;
    lastActivityTime = null;
    if (global._mongo) global._mongo = { conn: null, promise: null };
  }
}

/**
 * Returns whether mongoose is currently connected.
 */
function isConnected() {
  return connection.isConnected;
}

/**
 * Convert a mongoose document's IDs & dates to strings for JSON serialization.
 */
function convertDocToObj(doc) {
  if (doc._id) doc._id = doc._id.toString();
  if (doc.createdAt) doc.createdAt = doc.createdAt.toString();
  if (doc.updatedAt) doc.updatedAt = doc.updatedAt.toString();
  return doc;
}

/**
 * Returns the native MongoDB Db object for advanced operations.
 */
function getNativeConnection() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.db;
  }
  throw new Error("Database is not connected");
}

const db = {
  connect,
  disconnect,
  isConnected,
  convertDocToObj,
  getNativeConnection,
  updateLastActivityTime,
  checkAndDisconnect,
};

export default db;
