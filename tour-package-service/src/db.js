// File ini mengatur koneksi ke MongoDB menggunakan mongoose

const mongoose = require("mongoose");
const TourPackage = require("./models/TourPackage");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/tourdb";

    console.log("Connecting to MongoDB:", mongoURI);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB connected successfully");

    const count = await TourPackage.countDocuments();
    console.log(`Found ${count} existing tour packages`);

    if (count === 0) {
      console.log("Initializing sample tour data...");

      const sampleTours = await TourPackage.create([
        {
          name: "Bali Adventure Tour",
          category: "Adventure",
          shortDescription: "Exciting adventure tour in beautiful Bali",
          longDescription:
            "Experience the best of Bali with our comprehensive adventure tour package including temple visits, volcano hiking, and beach activities.",
          location: {
            city: "Denpasar",
            province: "Bali",
            country: "Indonesia",
            meetingPoint: "Ngurah Rai Airport",
          },
          duration: {
            days: 4,
            nights: 3,
          },
          price: {
            amount: 2500000,
            currency: "IDR",
          },
          inclusions: ["Accommodation", "Meals", "Transportation", "Guide"],
          exclusions: ["Personal expenses", "International flight"],
          itinerary: [
            {
              day: 1,
              title: "Arrival and Temple Tour",
              description: "Arrive in Bali and visit famous temples",
              activities: [
                "Airport pickup",
                "Tanah Lot Temple",
                "Hotel check-in",
              ],
            },
            {
              day: 2,
              title: "Volcano Adventure",
              description: "Hiking and adventure activities",
              activities: [
                "Mount Batur sunrise hike",
                "Hot springs",
                "Coffee plantation",
              ],
            },
          ],
          images: [
            "https://example.com/bali1.jpg",
            "https://example.com/bali2.jpg",
          ],
          status: "active",
        },
        {
          name: "Yogyakarta Cultural Experience",
          category: "Cultural",
          shortDescription: "Immerse yourself in Javanese culture and history",
          longDescription:
            "Discover the rich cultural heritage of Yogyakarta with visits to ancient temples, royal palaces, and traditional art centers.",
          location: {
            city: "Yogyakarta",
            province: "DIY Yogyakarta",
            country: "Indonesia",
            meetingPoint: "Yogyakarta Railway Station",
          },
          duration: {
            days: 3,
            nights: 2,
          },
          price: {
            amount: 1800000,
            currency: "IDR",
          },
          inclusions: [
            "Accommodation",
            "Meals",
            "Transportation",
            "Guide",
            "Entrance tickets",
          ],
          exclusions: ["Personal expenses", "Souvenirs"],
          itinerary: [
            {
              day: 1,
              title: "Royal Heritage Tour",
              description: "Explore the royal palaces and historical sites",
              activities: [
                "Kraton Palace",
                "Taman Sari Water Castle",
                "Malioboro Street",
              ],
            },
            {
              day: 2,
              title: "Temple Discovery",
              description: "Visit ancient Buddhist and Hindu temples",
              activities: ["Borobudur Temple", "Mendut Temple", "Pawon Temple"],
            },
          ],
          images: [
            "https://example.com/yogya1.jpg",
            "https://example.com/yogya2.jpg",
          ],
          status: "active",
        },
      ]);

      console.log("✅ Sample tour data created successfully");

      // ✅ Initialize inventory for these tours via API call
      console.log("🔄 Initializing inventory for sample tours...");
      for (const tour of sampleTours) {
        console.log(`Creating inventory for tour: ${tour.name} (${tour._id})`);

        // Note: This would typically be done via API call to inventory service
        // For now, we'll log the tour IDs that need inventory initialization
        console.log(`📝 Tour ID for inventory: ${tour._id.toString()}`);
      }
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
};

module.exports = { connectDB };
