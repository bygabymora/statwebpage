import mongoose from 'mongoose';

const connection = {};

async function connect() {
  try {
    // Check if already connected
    if (connection.isConnected) {
      console.log('Already connected to MongoDB');
      return;
    }

    // Check if there are existing connections
    if (mongoose.connections.length > 0) {
      connection.isConnected = mongoose.connections[0].readyState;
      if (connection.isConnected === 1) {
        console.log('Using existing connection to MongoDB');
        return;
      }
      // Disconnect if the connection is not ready
      await mongoose.disconnect();
    }

    // Connect to MongoDB
    const db = await mongoose.connect(process.env.MONGODB_URI_FINAL, {
      // Remove deprecated options
      // useNewUrlParser: true, // No longer needed
      // useUnifiedTopology: true, // No longer needed
    });

    connection.isConnected = db.connections[0].readyState;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

async function disconnect() {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.disconnect();
      connection.isConnected = false;
      console.log('Disconnected from MongoDB');
    } else {
      console.log('Not disconnected (development mode)');
    }
  }
}

const db = { connect, disconnect };
export default db;