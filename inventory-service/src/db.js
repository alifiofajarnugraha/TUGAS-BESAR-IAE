const mongoose = require("mongoose");
const Inventory = require("./models/Inventory");

async function initializeDB() {
  try {
    // Use the service name 'db' as defined in docker-compose.yml
    const mongoURI = process.env.MONGO_URI || "mongodb://db:27017/inventoryDB";

    console.log("Connecting to MongoDB at:", mongoURI);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    console.log("Connected to MongoDB");

    // Check if we already have data
    const count = await Inventory.countDocuments();
    if (count === 0) {
      // Add some initial data
      await Inventory.create([
        {
          tourId: "tour123",
          date: new Date().toISOString().split("T")[0],
          slots: 10,
          hotelAvailable: true,
          transportAvailable: true,
        },
      ]);
      console.log("Initial data created");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  }
}

module.exports = initializeDB;
