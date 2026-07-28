const mongoose = require('mongoose');

// Cache connection across serverless invocations / local restarts
let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

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
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
