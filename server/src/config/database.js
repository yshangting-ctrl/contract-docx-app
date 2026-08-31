import mongoose from "mongoose";

export async function connectMongo() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/telecom_contracts";

  if (!uri) {
    console.warn("MONGODB_URI is not set. Downloads still work, but history will not be saved.");
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected.");
    return true;
  } catch (error) {
    console.warn(`MongoDB connection failed: ${error.message}`);
    console.warn("Downloads still work, but history will not be saved until MongoDB is available.");
    return false;
  }
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}
