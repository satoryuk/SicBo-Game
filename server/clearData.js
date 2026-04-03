require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Round = require("./models/Round");

const clearData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await User.deleteMany({});
    console.log("✅ All users deleted");

    await Round.deleteMany({});
    console.log("✅ All rounds deleted");

    await mongoose.connection.close();
    console.log("✅ Database cleared successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error clearing data:", err);
    process.exit(1);
  }
};

clearData();