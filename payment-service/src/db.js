const mongoose = require("mongoose");

// Gunakan environment variable atau fallback ke localhost
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/paymentdb";

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB:", mongoUri);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

module.exports = mongoose;
