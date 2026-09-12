const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Clean up any legacy email index that may cause duplicate key errors
    try {
      const userCollection = conn.connection.collection('users');
      const indexes = await userCollection.indexes();
      const emailIndex = indexes.find((idx) => idx.name === 'email_1' || idx.key?.email);
      if (emailIndex) {
        await userCollection.dropIndex(emailIndex.name);
        console.log(`🧹 Dropped legacy index '${emailIndex.name}' from users collection`);
      }
    } catch (idxErr) {
      // Ignore index drop error if collection does not exist yet
    }
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
