import mongoose from 'mongoose';

const connection = {};

async function connect() {
  try {
    if (connection.isConnected) {
      console.log('already connected');
      return;
    }
    if (mongoose.connections.length > 0) {
      connection.isConnected = mongoose.connections[0].readyState;
      if (connection.isConnected === 1) {
        console.log('Using pre-connection to the database');
        return;
      }
      await mongoose.disconnect();
    }
    const db = await mongoose.connect(process.env.MONGODB_URI_FINAL, {
    });
    connection.isConnected = db.connections[0].readyState;
    console.log('already connected MongoDB');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
  }
}

async function disconnect() {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.disconnect();
      connection.isConnected = false;
    } else {
      console.log('not disconnected');
    }
  }
}


const db = { connect, disconnect };
export default db;
