import { randomUUID } from 'crypto';
import dbs from './db.js'; 
import { formatISO } from 'date-fns';

// ✅ ENHANCED: Better error handling and logging
const logInfo = (message) => console.log(`🌱 [SEEDER] ${message}`);
const logError = (message, error) => console.error(`❌ [SEEDER ERROR] ${message}:`, error);
const logSuccess = (message) => console.log(`✅ [SEEDER SUCCESS] ${message}`);

// ✅ ENHANCED: Check if tables exist and have data
async function checkExistingData() {
  logInfo('Checking for existing data...');
  
  try {
    const { rows: schedules } = await dbs.travelScheduleDB.query('SELECT COUNT(*) as count FROM "TravelSchedule"');
    const { rows: passengers } = await dbs.mainDB.query('SELECT COUNT(*) as count FROM "Passenger"');
    
    const scheduleCount = parseInt(schedules[0].count);
    const passengerCount = parseInt(passengers[0].count);
    
    logInfo(`Found ${scheduleCount} existing schedules, ${passengerCount} existing passengers`);
    
    return {
      hasSchedules: scheduleCount > 0,
      hasPassengers: passengerCount > 0,
      shouldSeed: scheduleCount === 0 && passengerCount === 0
    };
  } catch (error) {
    logError('Error checking existing data', error);
    return { shouldSeed: true }; // Seed if we can't check
  }
}

// ✅ ENHANCED: Clear existing data with confirmation
async function clearTables() {
  logInfo('Clearing existing tables...');
  
  const clearQueries = [
    { db: dbs.refundRequestDB, table: 'RefundRequest', name: 'refund requests' },
    { db: dbs.travelHistoryDB, table: 'TravelHistory', name: 'travel history' },
    { db: dbs.bookingDB, table: 'Booking', name: 'bookings' },
    { db: dbs.travelScheduleDB, table: 'TravelSchedule', name: 'travel schedules' },
    { db: dbs.recommendationDB, table: 'Recommendation', name: 'recommendations' },
    { db: dbs.mainDB, table: 'Passenger', name: 'passengers' }
  ];
  
  for (const { db, table, name } of clearQueries) {
    try {
      const { rowCount } = await db.query(`DELETE FROM "${table}"`);
      logSuccess(`Cleared ${rowCount} ${name}`);
    } catch (error) {
      logError(`Failed to clear ${name}`, error);
      throw error;
    }
  }
}

// ✅ ENHANCED: Passengers with more realistic data
async function seedPassengers() {
  logInfo('Creating passengers...');
  
  const passengers = [
    { id: 1, name: 'Ahmad Wijaya', email: 'ahmad.wijaya@example.com' },
    { id: 2, name: 'Siti Nurhaliza', email: 'siti.nurhaliza@example.com' },
    { id: 3, name: 'Budi Santoso', email: 'budi.santoso@example.com' },
    { id: 4, name: 'Dewi Sartika', email: 'dewi.sartika@example.com' },
    { id: 5, name: 'Ravi Sharma', email: 'ravi.sharma@example.com' },
    { id: 6, name: 'Maya Indah', email: 'maya.indah@example.com' },
    { id: 7, name: 'Fajar Nugroho', email: 'fajar.nugroho@example.com' },
    { id: 8, name: 'Linda Putri', email: 'linda.putri@example.com' }
  ];

  const insertPassengerQuery = 'INSERT INTO "Passenger" (id, name, email) VALUES ($1, $2, $3)';
  
  for (const passenger of passengers) {
    try {
      await dbs.mainDB.query(insertPassengerQuery, [passenger.id, passenger.name, passenger.email]);
    } catch (error) {
      logError(`Failed to insert passenger ${passenger.name}`, error);
      throw error;
    }
  }

  logSuccess(`Created ${passengers.length} passengers`);
  return passengers;
}

// ✅ ENHANCED: More diverse travel schedules
async function seedTravelSchedules() {
  logInfo('Creating travel schedules...');
  
  const routes = [
    // Java Island Routes
    { origin: 'Jakarta', destination: 'Bandung' },
    { origin: 'Jakarta', destination: 'Bogor' },
    { origin: 'Jakarta', destination: 'Yogyakarta' },
    { origin: 'Jakarta', destination: 'Surabaya' },
    { origin: 'Bandung', destination: 'Jakarta' },
    { origin: 'Bandung', destination: 'Yogyakarta' },
    { origin: 'Yogyakarta', destination: 'Solo' },
    { origin: 'Yogyakarta', destination: 'Semarang' },
    { origin: 'Surabaya', destination: 'Malang' },
    { origin: 'Surabaya', destination: 'Banyuwangi' },
    { origin: 'Semarang', destination: 'Yogyakarta' },
    { origin: 'Solo', destination: 'Yogyakarta' },
    
    // Sumatra Routes
    { origin: 'Medan', destination: 'Padang' },
    { origin: 'Palembang', destination: 'Lampung' },
    
    // Bali Routes
    { origin: 'Denpasar', destination: 'Ubud' },
    { origin: 'Denpasar', destination: 'Singaraja' }
  ];
  
  const vehicleTypes = [
    { type: 'Bus', seats: [45, 50, 55] },
    { type: 'Minibus', seats: [12, 15, 18] },
    { type: 'Van', seats: [8, 10, 12] },
    { type: 'SUV', seats: [6, 7, 8] },
    { type: 'Sedan', seats: [4, 5] },
    { type: 'Train', seats: [200, 250, 300] }
  ];
  
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 2); // Extended to 2 months
  
  const schedules = [];
  let scheduleId = 1;
  
  routes.forEach(route => {
    // Create 3-5 schedules per route for variety
    const schedulesPerRoute = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < schedulesPerRoute; i++) {
      const vehicleInfo = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const maxSeats = vehicleInfo.seats[Math.floor(Math.random() * vehicleInfo.seats.length)];
      
      // Create more realistic departure times (6 AM to 10 PM)
      const departureTime = new Date(now);
      departureTime.setDate(now.getDate() + Math.floor(Math.random() * 60)); // Next 2 months
      departureTime.setHours(6 + Math.floor(Math.random() * 16), Math.floor(Math.random() * 60)); // 6 AM - 10 PM
      
      // Calculate arrival time based on distance (2-8 hours)
      const arrivalTime = new Date(departureTime);
      const travelHours = 2 + Math.floor(Math.random() * 6);
      arrivalTime.setHours(arrivalTime.getHours() + travelHours);
      
      // Calculate price based on distance and vehicle type
      let basePrice = 50000;
      if (vehicleInfo.type === 'Train') basePrice = 100000;
      else if (vehicleInfo.type === 'Bus') basePrice = 75000;
      else if (vehicleInfo.type === 'SUV') basePrice = 200000;
      
      const distanceMultiplier = route.origin === 'Jakarta' ? 1.5 : 1.0;
      const finalPrice = Math.floor(basePrice * distanceMultiplier * (0.8 + Math.random() * 0.4));
      
      const schedule = {
        id: scheduleId++,
        origin: route.origin,
        destination: route.destination,
        departureTime: formatISO(departureTime),
        arrivalTime: formatISO(arrivalTime),
        price: finalPrice,
        seatsAvailable: Math.floor(maxSeats * (0.3 + Math.random() * 0.7)), // 30-100% available
        vehicleType: vehicleInfo.type
      };
      schedules.push(schedule);
    }
  });
  
  const insertScheduleQuery = 'INSERT INTO "TravelSchedule" (id, origin, destination, departureTime, arrivalTime, price, seatsAvailable, vehicleType) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
  
  for (const schedule of schedules) {
    try {
      await dbs.travelScheduleDB.query(insertScheduleQuery, [
        schedule.id, schedule.origin, schedule.destination, 
        schedule.departureTime, schedule.arrivalTime, 
        schedule.price, schedule.seatsAvailable, schedule.vehicleType
      ]);
    } catch (error) {
      logError(`Failed to insert schedule ${schedule.id}`, error);
      throw error;
    }
  }
  
  logSuccess(`Created ${schedules.length} travel schedules`);
  return schedules;
}

// ✅ ENHANCED: More realistic booking data
async function seedBookings(passengers, schedules) {
  logInfo('Creating bookings...');
  
  const bookings = [];
  const statuses = ['CONFIRMED', 'CANCELLED', 'REFUNDED'];
  const statusWeights = [0.7, 0.2, 0.1]; // 70% confirmed, 20% cancelled, 10% refunded
  
  let bookingId = 1;
  
  passengers.forEach(passenger => {
    const bookingCount = 1 + Math.floor(Math.random() * 4); // 1-4 bookings per passenger
    
    for (let i = 0; i < bookingCount; i++) {
      const schedule = schedules[Math.floor(Math.random() * schedules.length)];
      
      // More realistic booking times (1-30 days ago)
      const now = new Date();
      const bookingTime = new Date(now);
      bookingTime.setDate(now.getDate() - Math.floor(Math.random() * 30));
      
      // Weighted random status selection
      const randomValue = Math.random();
      let status = statuses[0]; // Default to CONFIRMED
      if (randomValue > statusWeights[0]) {
        status = randomValue > (statusWeights[0] + statusWeights[1]) ? statuses[2] : statuses[1];
      }
      
      bookings.push({
        id: bookingId++,
        passengerId: passenger.id,
        scheduleId: schedule.id,
        bookingTime: formatISO(bookingTime),
        status: status
      });
    }
  });
  
  const insertBookingQuery = 'INSERT INTO "Booking" (id, passengerId, scheduleId, bookingTime, status) VALUES ($1, $2, $3, $4, $5)';
  
  for (const booking of bookings) {
    try {
      await dbs.bookingDB.query(insertBookingQuery, [
        booking.id, booking.passengerId, booking.scheduleId, 
        booking.bookingTime, booking.status
      ]);
    } catch (error) {
      logError(`Failed to insert booking ${booking.id}`, error);
      throw error;
    }
  }
  
  logSuccess(`Created ${bookings.length} bookings`);
  return bookings;
}

// ✅ ENHANCED: More realistic travel history
async function seedTravelHistory(passengers, schedules) {
  logInfo('Creating travel history...');
  
  const histories = [];
  const ratings = [3.0, 3.5, 4.0, 4.2, 4.5, 4.7, 5.0];
  const ratingWeights = [0.05, 0.10, 0.15, 0.25, 0.25, 0.15, 0.05]; // Bell curve distribution
  
  const reviews = [
    "Excellent service! Very comfortable and punctual.",
    "Driver was professional and the vehicle was clean.",
    "Good experience overall, would recommend.",
    "Journey was smooth and on time.",
    "Comfortable seats and good air conditioning.",
    "Professional service, arrived safely.",
    "Vehicle was well-maintained and clean.",
    "Driver was friendly and helpful.",
    "Good value for money.",
    "Safe and reliable transportation.",
    null, null, null // Some entries without reviews
  ];
  
  let historyId = 1;
  
  passengers.forEach(passenger => {
    const historyCount = Math.floor(Math.random() * 4); // 0-3 completed trips
    
    for (let i = 0; i < historyCount; i++) {
      const schedule = schedules[Math.floor(Math.random() * schedules.length)];
      
      // Completed trips should be in the past (1-90 days ago)
      const now = new Date();
      const completedAt = new Date(now);
      completedAt.setDate(now.getDate() - (1 + Math.floor(Math.random() * 89)));
      
      // 80% chance of having a rating
      const hasRating = Math.random() > 0.2;
      let rating = null;
      let review = null;
      
      if (hasRating) {
        // Weighted random rating selection
        const randomValue = Math.random();
        let cumulativeWeight = 0;
        for (let j = 0; j < ratings.length; j++) {
          cumulativeWeight += ratingWeights[j];
          if (randomValue <= cumulativeWeight) {
            rating = ratings[j];
            break;
          }
        }
        
        // 60% chance of having a review if rated
        if (Math.random() > 0.4) {
          review = reviews[Math.floor(Math.random() * reviews.length)];
        }
      }
      
      histories.push({
        id: historyId++,
        passengerId: passenger.id,
        scheduleId: schedule.id,
        completedAt: formatISO(completedAt),
        rating: rating,
        review: review
      });
    }
  });
  
  const insertHistoryQuery = 'INSERT INTO "TravelHistory" (id, passengerId, scheduleId, completedAt, rating, review) VALUES ($1, $2, $3, $4, $5, $6)';
  
  for (const history of histories) {
    try {
      await dbs.travelHistoryDB.query(insertHistoryQuery, [
        history.id, history.passengerId, history.scheduleId, 
        history.completedAt, history.rating, history.review
      ]);
    } catch (error) {
      logError(`Failed to insert history ${history.id}`, error);
      throw error;
    }
  }
  
  logSuccess(`Created ${histories.length} travel history entries`);
  return histories;
}

// ✅ ENHANCED: More realistic refund requests
async function seedRefundRequests(bookings) {
  logInfo('Creating refund requests...');
  
  const refundRequests = [];
  const reasons = [
    "Schedule change by operator",
    "Personal emergency situation",
    "Weather conditions",
    "Flight/train connection missed",
    "Medical reasons",
    "Work conflict",
    "Found alternative transportation",
    "Vehicle breakdown reported"
  ];
  
  // Only cancelled or refunded bookings can have refund requests
  const eligibleBookings = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REFUNDED');
  
  let refundRequestId = 1;
  
  eligibleBookings.forEach(booking => {
    // 60% chance of having a refund request for eligible bookings
    if (Math.random() > 0.4) {
      const now = new Date();
      const bookingDate = new Date(booking.bookingTime);
      
      // Refund requested within 1-7 days after booking
      const requestedAt = new Date(bookingDate);
      requestedAt.setDate(bookingDate.getDate() + Math.floor(Math.random() * 7));
      
      // 70% chance of being processed
      const isProcessed = Math.random() > 0.3;
      let processedAt = null;
      let status = 'PENDING';
      
      if (isProcessed) {
        processedAt = new Date(requestedAt);
        processedAt.setDate(requestedAt.getDate() + 1 + Math.floor(Math.random() * 5)); // 1-5 days to process
        
        // 80% approval rate for processed requests
        status = Math.random() > 0.2 ? 'APPROVED' : 'REJECTED';
      }
      
      refundRequests.push({
        id: refundRequestId++,
        bookingId: booking.id,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: status,
        requestedAt: formatISO(requestedAt),
        processedAt: processedAt ? formatISO(processedAt) : null
      });
    }
  });
  
  const insertRefundQuery = 'INSERT INTO "RefundRequest" (id, bookingId, reason, status, requestedAt, processedAt) VALUES ($1, $2, $3, $4, $5, $6)';
  
  for (const refund of refundRequests) {
    try {
      await dbs.refundRequestDB.query(insertRefundQuery, [
        refund.id, refund.bookingId, refund.reason, 
        refund.status, refund.requestedAt, refund.processedAt
      ]);
    } catch (error) {
      logError(`Failed to insert refund request ${refund.id}`, error);
      throw error;
    }
  }
  
  logSuccess(`Created ${refundRequests.length} refund requests`);
  return refundRequests;
}

// ✅ ENHANCED: Smarter recommendations
async function seedRecommendations(passengers, schedules) {
  logInfo('Creating recommendations...');
  
  const recommendationsData = [];
  let recommendationId = 1;
  
  passengers.forEach(passenger => {
    // 70% chance of having recommendations
    if (Math.random() > 0.3) {
      const now = new Date();
      const generatedAt = new Date(now);
      generatedAt.setDate(now.getDate() - Math.floor(Math.random() * 7)); // Generated within last week

      // Select 2-4 relevant schedules for recommendation
      const numRecs = 2 + Math.floor(Math.random() * 3);
      const recommendedScheduleIds = [];
      
      // Try to recommend diverse routes
      const usedOrigins = new Set();
      let attempts = 0;
      
      while (recommendedScheduleIds.length < numRecs && attempts < schedules.length) {
        const schedule = schedules[Math.floor(Math.random() * schedules.length)];
        
        // Prefer different origins for variety
        if (!usedOrigins.has(schedule.origin) || usedOrigins.size >= numRecs) {
          recommendedScheduleIds.push(schedule.id);
          usedOrigins.add(schedule.origin);
        }
        attempts++;
      }
      
      recommendationsData.push({
        id: recommendationId++,
        passengerId: passenger.id,
        recommendedSchedules: JSON.stringify(recommendedScheduleIds),
        generatedAt: formatISO(generatedAt)
      });
    }
  });
  
  const insertRecommendationQuery = 'INSERT INTO "Recommendation" (id, passengerId, recommendedSchedules, generatedAt) VALUES ($1, $2, $3, $4)';
  
  for (const rec of recommendationsData) {
    try {
      await dbs.recommendationDB.query(insertRecommendationQuery, [
        rec.id, rec.passengerId, rec.recommendedSchedules, rec.generatedAt
      ]);
    } catch (error) {
      logError(`Failed to insert recommendation ${rec.id}`, error);
      throw error;
    }
  }
  
  logSuccess(`Created ${recommendationsData.length} recommendations`);
  return recommendationsData;
}

// ✅ ENHANCED: Main seeder function with better control
async function seedDatabase() {
  logInfo('🌱 Starting database seeding process...');
  
  try {
    // Check if data already exists
    const existingData = await checkExistingData();
    
    if (!existingData.shouldSeed) {
      logInfo('⚠️ Database already contains data. Skipping seeding...');
      logInfo(`Found ${existingData.hasSchedules ? 'existing' : 'no'} schedules and ${existingData.hasPassengers ? 'existing' : 'no'} passengers`);
      return;
    }
    
    logInfo('📊 Database is empty. Starting seeding process...');
    
    // Clear any existing data
    await clearTables();
    
    // Seed in dependency order
    logInfo('👥 Creating passengers...');
    const passengers = await seedPassengers();
    
    logInfo('🚌 Creating travel schedules...');
    const schedules = await seedTravelSchedules();
    
    logInfo('📋 Creating bookings...');
    const bookings = await seedBookings(passengers, schedules);
    
    logInfo('📚 Creating travel history...');
    await seedTravelHistory(passengers, schedules);
    
    logInfo('💰 Creating refund requests...');
    await seedRefundRequests(bookings);
    
    logInfo('🎯 Creating recommendations...');
    await seedRecommendations(passengers, schedules);
    
    logSuccess('🎉 Database seeded successfully!');
    logInfo(`📊 Summary: ${passengers.length} passengers, ${schedules.length} schedules, ${bookings.length} bookings`);
    
  } catch (error) {
    logError('🔥 Database seeding failed', error);
    throw error; // Re-throw to let caller handle
  }
}

// ✅ Execute the seeder
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      logSuccess('✅ Seeding process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logError('❌ Seeding process failed', error);
      process.exit(1);
    });
}

export default seedDatabase;
