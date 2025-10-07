const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ Falta MONGODB_URI en .env");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("✅ Conectado a MongoDB");
}

module.exports = { connectDB };
