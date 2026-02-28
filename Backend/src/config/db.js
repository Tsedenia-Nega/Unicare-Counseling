import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => console.log("Database connected"));
    mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'unicare',
      // These are included by default in newer versions but adding explicitly for clarity
      // useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// MongoDB connection function
// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1); // Exit process with failure
//   }
// };

export default connectDB;
