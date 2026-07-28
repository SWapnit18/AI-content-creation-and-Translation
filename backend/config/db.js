const mongoose = require('mongoose');

// Disable Mongoose query buffering globally so operations fail fast / reconnect instead of hanging for 10s
mongoose.set('bufferCommands', false);

const defaultUri = 'mongodb+srv://patelswapnit_db_user:MongoPass2024@cluster0.iecgwuk.mongodb.net/ai-content-creation?retryWrites=true&w=majority';

const connectDB = async () => {
  // 1. If already connected, return connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If currently connecting, wait for connection promise
  if (mongoose.connection.readyState === 2) {
    try {
      await mongoose.connection.asPromise();
      return mongoose.connection;
    } catch (e) {
      // Fall through to reconnect if previous attempt failed
    }
  }

  // 3. Determine connection URI
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

  // 4. Connect with fallback timeout & retries
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB (${error.message}). Retrying...`);
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅ MongoDB Connected on Retry: ${conn.connection.host}`);
      return conn;
    } catch (retryErr) {
      console.error(`❌ MongoDB Retry Failed: ${retryErr.message}`);
      throw retryErr;
    }
  }
};

module.exports = connectDB;
