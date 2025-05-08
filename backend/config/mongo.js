// const mongoose = require('mongoose');

// const connectMongoDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI); // ✅ Removed deprecated options
//     console.log('Connected to MongoDB');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   }
// };

// module.exports = connectMongoDB;
const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MongoDB URI not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true, // Ensure we’re using the latest MongoDB connection parser
      useUnifiedTopology: true, // Helps with monitoring and connection stability
    });

    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
