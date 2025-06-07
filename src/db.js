const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

async function initializeDB() {
  try {
    // Use local MongoDB when running locally, Docker MongoDB when running in container
    const mongoURI = process.env.NODE_ENV === 'development' 
      ? 'mongodb://inventory-mongo:27017/inventoryDB'  // Docker MongoDB service name
      : process.env.MONGO_URI;                         // Environment variable

    console.log('Connecting to MongoDB at:', mongoURI);
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if we already have data
    const count = await Inventory.countDocuments();
    if (count === 0) {
      // Add some initial data
      await Inventory.create([
        {
          tourId: 'tour123',
          date: new Date().toISOString().split('T')[0],
          slots: 10,
          hotelAvailable: true,
          transportAvailable: true
        },
        {
          tourId: 'tour123',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
          slots: 15,
          hotelAvailable: true,
          transportAvailable: true
        }
      ]);
      console.log('Initial data created');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

module.exports = initializeDB;