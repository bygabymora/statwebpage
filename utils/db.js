import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI_FINAL || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI_FINAL environment variable");
}

// Use global cache in development to prevent multiple connections
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    console.log("Reusing existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new MongoDB connection...");
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false, // Helps prevent unexpected behavior in serverless environments
    }).then((mongoose) => {
      console.log("Connected to MongoDB");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;