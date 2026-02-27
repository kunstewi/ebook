import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const isTest = process.env.NODE_ENV === 'test';
    const uri = isTest
      ? 'mongodb://localhost:27017/ebook-db-test'
      : (process.env.MONGO_URI as string);

    await mongoose.connect(uri, {});
    console.log(`MongoDB Connected ${isTest ? '(Test DB)' : ''}`);
  } catch (err) {
    console.error("Error Connecting to MongoDB", err);
    process.exit(1);
  }
};

export default connectDB;
