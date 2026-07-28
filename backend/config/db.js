const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Build URI from parts (avoids dotenvx mangling special chars like # in passwords)
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
      console.log('ℹ️ MONGO_URI env not found. Using default cluster connection.');
      uri = defaultUri;
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Do not exit process for local demonstration
  }
};

module.exports = connectDB;
