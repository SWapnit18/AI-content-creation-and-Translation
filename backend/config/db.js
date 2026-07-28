const mongoose = require('mongoose');

// Disable Mongoose query buffering globally so operations fail fast / reconnect instead of hanging for 10s
mongoose.set('bufferCommands', false);

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If another request is currently connecting, wait for it
  if (isConnecting) {
    let attempts = 0;
    while (isConnecting && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
      if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
      }
    }
  }

  isConnecting = true;
  try {
    const defaultUri = 'mongodb+srv://patelswapnit_db_user:MongoPass2024@cluster0.iecgwuk.mongodb.net/ai-content-creation?retryWrites=true&w=majority';
    let uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri && process.env.MONGO_HOST) {
      const user = encodeURIComponent(process.env.MONGO_USER || '');
      const pass = encodeURIComponent(process.env.MONGO_PASS || '');
      const host = process.env.MONGO_HOST;
      const db   = process.env.MONGO_DB || 'ai-content-creation';
      uri = `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority`;
    }

    if (!uri) {
      uri = defaultUri;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnecting = false;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
