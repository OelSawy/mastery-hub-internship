import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Corrected method name and use of `await`
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true // Ensures indexes are created in MongoDB
    });
    
    // Corrected template literal syntax with backticks
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Corrected template literal syntax and variable reference
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};