const mongoose = require("mongoose");
const Inventory = require("./models/Inventory");

async function initializeDB() {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/inventorydb";

    console.log("Connecting to MongoDB at:", mongoURI);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected successfully");

    const count = await Inventory.countDocuments();
    console.log(`Found ${count} existing inventory records`);

    if (count === 0) {
      console.log("Initializing sample inventory data...");

      // ✅ Create inventory with proper tour IDs from tour service
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      await Inventory.create([
        // Bali Adventure Tour inventory
        {
          tourId: "68554ed6cbe10a2290b2da49", // This should match actual tour ID
          date: today,
          slots: 20,
          hotelAvailable: true,
          transportAvailable: true,
        },
        {
          tourId: "68554ed6cbe10a2290b2da49",
          date: tomorrow,
          slots: 18,
          hotelAvailable: true,
          transportAvailable: true,
        },
        {
          tourId: "68554ed6cbe10a2290b2da49",
          date: dayAfter,
          slots: 15,
          hotelAvailable: true,
          transportAvailable: false,
        },
        // Yogyakarta Cultural Experience inventory
        {
          tourId: "68554ed6cbe10a2290b2da4a", // This should match actual tour ID
          date: today,
          slots: 10,
          hotelAvailable: false,
          transportAvailable: true,
        },
        {
          tourId: "68554ed6cbe10a2290b2da4a",
          date: tomorrow,
          slots: 12,
          hotelAvailable: true,
          transportAvailable: true,
        },
      ]);

      console.log("✅ Sample inventory data created successfully");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

module.exports = initializeDB;
