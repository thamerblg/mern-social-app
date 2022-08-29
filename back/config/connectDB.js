const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/.env" });

const DATABASE_URI = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("db connected with success");
  } catch (error) {
    console.log(error);
  }
}

module.exports = connectDB;
