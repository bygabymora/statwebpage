import mongoose from 'mongoose';

const connection = {};

async function connect() {
  try {
    if (connection.isConnected) {
      console.log('already connected');
      return;
    }
    const db = await mongoose.connect(process.env.MONGODB_URI_FINAL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connection.isConnected = db.connections[0].readyState;
    console.log('Conexión exitosa a MongoDB');
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
