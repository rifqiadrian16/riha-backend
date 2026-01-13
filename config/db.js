const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Mengambil URL dari file .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Terkoneksi: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
