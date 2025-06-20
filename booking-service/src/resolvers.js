const db = require("./db");
const axios = require("axios");
require("dotenv").config();

// ✅ FIXED: Tour Service Configuration untuk Docker
const TOUR_SERVICE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.TOUR_SERVICE_URL || "http://tour-service:3002/graphql"
    : "http://localhost:3002/graphql";

console.log("🔧 Service configuration:");
console.log(`   Tour Service URL: ${TOUR_SERVICE_URL}`);
console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
console.log(
  `   Using Docker networking: ${
    process.env.NODE_ENV === "production" ? "YES" : "NO"
  }`
);

// ✅ Enhanced Tour Service caller dengan Docker networking support
const callTourService = async (query, variables = {}) => {
  try {
    console.log(`📞 Calling tour service: ${TOUR_SERVICE_URL}`);
    console.log(`📝 Query variables:`, variables);

    const response = await axios.post(
      TOUR_SERVICE_URL,
      { query, variables },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "booking-service/1.0.0",
        },
        timeout: 10000, // Increased timeout for Docker
      }
    );

    if (response.data.errors) {
      console.error("❌ Tour service GraphQL errors:", response.data.errors);
      throw new Error(`Tour service error: ${response.data.errors[0].message}`);
    }

    if (!response.data.data) {
      console.error("❌ Tour service returned no data");
      throw new Error("Tour service returned no data");
    }

    console.log("✅ Tour service response received successfully");
    return response.data.data;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error("❌ Tour service connection refused");
      console.error("💡 Solutions:");

      if (process.env.NODE_ENV === "production") {
        // Docker environment
        console.error(
          "   1. Check if tour-service container is running: docker ps | grep tour-service"
        );
        console.error("   2. Check Docker network: docker network ls");
        console.error(
          "   3. Test connection: docker exec booking-service curl http://tour-service:3002/health"
        );
        console.error(
          "   4. Check service discovery: docker exec booking-service nslookup tour-service"
        );
      } else {
        // Local environment
        console.error(
          "   1. Check if tour-package-service is running: curl http://localhost:3002/health"
        );
        console.error(
          "   2. Start tour service: cd tour-package-service && npm start"
        );
        console.error("   3. Check local port: netstat -tulpn | grep 3002");
      }

      throw new Error(
        process.env.NODE_ENV === "production"
          ? "Tour service container is not reachable. Please check Docker services."
          : "Tour service is not running. Please start tour-package-service first."
      );
    } else if (error.code === "ETIMEDOUT") {
      console.error("❌ Tour service timeout");
      throw new Error("Tour service timeout. Please try again.");
    }

    console.error("❌ Tour service call failed:", error.message);
    throw new Error(`Failed to fetch tour data: ${error.message}`);
  }
};

const resolvers = {
  Query: {
    getBooking: async (_, { id }) => {
      const result = await db.query("SELECT * FROM bookings WHERE id = $1", [
        id,
      ]);
      return transformBooking(result.rows[0]);
    },

    getUserBookings: async (_, { userId }) => {
      const result = await db.query(
        "SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      return result.rows.map(transformBooking);
    },

    getAllBookings: async () => {
      const result = await db.query(
        "SELECT * FROM bookings ORDER BY created_at DESC"
      );
      return result.rows.map(transformBooking);
    },

    getBookingsByStatus: async (_, { status }) => {
      const result = await db.query(
        "SELECT * FROM bookings WHERE status = $1 ORDER BY created_at DESC",
        [status]
      );
      return result.rows.map(transformBooking);
    },

    getBookingsByDateRange: async (_, { startDate, endDate }) => {
      const result = await db.query(
        "SELECT * FROM bookings WHERE departure_date BETWEEN $1::date AND $2::date ORDER BY departure_date",
        [startDate, endDate]
      );
      return result.rows.map(transformBooking);
    },

    // ✅ UPDATED: Calculate booking cost dengan real tour data integration
    calculateBookingCost: async (
      _,
      { tourId, participants, departureDate }
    ) => {
      try {
        console.log("📊 ==> Calculate cost request:", {
          tourId,
          participants,
          departureDate,
          timestamp: new Date().toISOString(),
        });

        // ✅ Validate inputs
        if (!departureDate || !departureDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          throw new Error("Invalid date format. Expected YYYY-MM-DD");
        }

        if (!participants || participants < 1 || participants > 20) {
          throw new Error("Participants must be between 1 and 20");
        }

        // ✅ Fetch tour data from Tour Package Service
        console.log(`🔍 Fetching tour data for ID: ${tourId}`);
        const tourQuery = `
          query GetTourPackage($id: ID!) {
            getTourPackage(id: $id) {
              id
              name
              price {
                amount
                currency
              }
              location {
                city
                country
              }
              duration {
                days
                nights
              }
              status
            }
          }
        `;

        const tourData = await callTourService(tourQuery, { id: tourId });

        if (!tourData?.getTourPackage) {
          throw new Error(
            `Tour package with ID ${tourId} not found in tour service`
          );
        }

        const tour = tourData.getTourPackage;
        console.log(
          `📦 Tour found: ${tour.name} - ${tour.price.amount} ${tour.price.currency}`
        );

        // ✅ Check if tour is active
        if (tour.status !== "active") {
          throw new Error(
            `Tour "${tour.name}" is currently ${tour.status} and not available for booking`
          );
        }

        // ✅ Real calculation dengan tour data
        const basePrice = tour.price.amount;
        const currency = tour.price.currency;
        const subtotal = basePrice * participants;

        // ✅ Tax calculation
        const taxRate = currency === "IDR" ? 0.11 : 0.1; // 11% for IDR, 10% for others
        const tax = subtotal * taxRate;

        // ✅ Service fee based on currency
        const serviceFee = currency === "IDR" ? 50000 : 10; // IDR 50K or $10

        // ✅ Group discount (5% for 5+ participants)
        const discount = participants >= 5 ? subtotal * 0.05 : 0;

        // ✅ Duration-based fee
        const durationFee =
          tour.duration.days > 3
            ? (tour.duration.days - 3) * (currency === "IDR" ? 100000 : 20)
            : 0;

        const totalCost = subtotal + tax + serviceFee + durationFee - discount;

        const result = {
          basePrice,
          participants,
          subtotal: Math.round(subtotal),
          tax: Math.round(tax),
          discount: Math.round(discount),
          totalCost: Math.round(totalCost),
          breakdown: [
            {
              item: `${tour.name} - Base Package`,
              amount: basePrice,
              quantity: 1,
            },
            ...(participants > 1
              ? [
                  {
                    item: "Additional Participants",
                    amount: basePrice * (participants - 1),
                    quantity: participants - 1,
                  },
                ]
              : []),
            {
              item: `Tax (${Math.round(taxRate * 100)}%)`,
              amount: Math.round(tax),
              quantity: 1,
            },
            {
              item: "Service Fee",
              amount: serviceFee,
              quantity: 1,
            },
            ...(durationFee > 0
              ? [
                  {
                    item: `Extended Duration Fee (${tour.duration.days} days)`,
                    amount: durationFee,
                    quantity: 1,
                  },
                ]
              : []),
            ...(discount > 0
              ? [
                  {
                    item: "Group Discount (5%)",
                    amount: -Math.round(discount),
                    quantity: 1,
                  },
                ]
              : []),
          ],
          tourInfo: {
            id: tour.id,
            name: tour.name,
            location: `${tour.location.city}, ${tour.location.country}`,
            duration: `${tour.duration.days} days, ${tour.duration.nights} nights`,
            currency: tour.price.currency,
            priceAmount: tour.price.amount,
          },
        };

        console.log("✅ Cost calculation successful:", {
          basePrice: result.basePrice,
          participants: result.participants,
          totalCost: result.totalCost,
          currency: tour.price.currency,
        });

        return result;
      } catch (error) {
        console.error("❌ Cost calculation error:", error.message);
        throw new Error(`Failed to calculate booking cost: ${error.message}`);
      }
    },

    // ✅ UPDATED: Check availability dengan tour validation
    checkAvailability: async (_, { tourId, date, participants }) => {
      try {
        console.log("🔍 ==> Check availability request:", {
          tourId,
          date,
          participants,
          timestamp: new Date().toISOString(),
        });

        // ✅ Validate inputs
        if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          throw new Error("Invalid date format. Expected YYYY-MM-DD");
        }

        if (!participants || participants < 1 || participants > 20) {
          throw new Error("Participants must be between 1 and 20");
        }

        // ✅ Check if date is in the past
        const today = new Date();
        const requestDate = new Date(date + "T00:00:00");

        if (requestDate < today) {
          return {
            available: false,
            message: "Cannot book for past dates",
            slotsLeft: 0,
            hotelAvailable: false,
            transportAvailable: false,
          };
        }

        // ✅ Validate tour exists and is active
        console.log(`🔍 Validating tour: ${tourId}`);
        const tourQuery = `
          query GetTourPackage($id: ID!) {
            getTourPackage(id: $id) {
              id
              name
              status
              location {
                city
                country
              }
            }
          }
        `;

        const tourData = await callTourService(tourQuery, { id: tourId });

        if (!tourData?.getTourPackage) {
          return {
            available: false,
            message: `Tour package with ID ${tourId} not found`,
            slotsLeft: 0,
            hotelAvailable: false,
            transportAvailable: false,
          };
        }

        const tour = tourData.getTourPackage;
        console.log(`📦 Tour validated: ${tour.name} - ${tour.status}`);

        if (tour.status !== "active") {
          return {
            available: false,
            message: `Tour "${tour.name}" is currently ${tour.status} and not available for booking`,
            slotsLeft: 0,
            hotelAvailable: false,
            transportAvailable: false,
          };
        }

        // ✅ Check existing bookings for this tour and date
        const existingBookings = await db.query(
          "SELECT SUM(participants) as total_booked FROM bookings WHERE tour_id = $1 AND departure_date = $2::date AND status != 'CANCELLED'",
          [tourId, date]
        );

        const totalBooked =
          parseInt(existingBookings.rows[0]?.total_booked) || 0;
        const maxSlots = 20; // Mock max slots
        const slotsLeft = Math.max(0, maxSlots - totalBooked);
        const available = slotsLeft >= participants;

        const result = {
          available,
          message: available
            ? `Available! ${slotsLeft} slots remaining for "${tour.name}" in ${tour.location.city}`
            : `Not enough slots available for "${tour.name}". Only ${slotsLeft} slots left, but you need ${participants}`,
          slotsLeft,
          hotelAvailable: true,
          transportAvailable: true,
          tourInfo: {
            name: tour.name,
            location: `${tour.location.city}, ${tour.location.country}`,
          },
        };

        console.log("✅ Availability check successful:", {
          available: result.available,
          slotsLeft: result.slotsLeft,
          totalBooked: totalBooked,
        });

        return result;
      } catch (error) {
        console.error("❌ Availability check error:", error.message);
        return {
          available: false,
          message: `Unable to check availability: ${error.message}`,
          slotsLeft: 0,
          hotelAvailable: false,
          transportAvailable: false,
        };
      }
    },
  },

  Mutation: {
    // ✅ UPDATED: Create booking dengan tour integration
    createBooking: async (_, { input }) => {
      try {
        console.log("📝 ==> Create booking request:", input);

        const { userId, tourId, departureDate, participants, notes } = input;

        // ✅ Validate date format
        if (!departureDate || !departureDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          throw new Error("Invalid departure date format. Expected YYYY-MM-DD");
        }

        // ✅ Get tour data and validate
        const tourQuery = `
          query GetTourPackage($id: ID!) {
            getTourPackage(id: $id) {
              id
              name
              status
              price {
                amount
                currency
              }
              location {
                city
                country
              }
            }
          }
        `;

        const tourData = await callTourService(tourQuery, { id: tourId });

        if (!tourData?.getTourPackage) {
          throw new Error(`Tour package with ID ${tourId} not found`);
        }

        const tour = tourData.getTourPackage;

        if (tour.status !== "active") {
          throw new Error(
            `Tour "${tour.name}" is currently ${tour.status} and not available for booking`
          );
        }

        // ✅ Check availability
        const availability = await resolvers.Query.checkAvailability(_, {
          tourId,
          date: departureDate,
          participants,
        });

        if (!availability.available) {
          throw new Error(`Booking not available: ${availability.message}`);
        }

        // ✅ Calculate total cost
        const calculation = await resolvers.Query.calculateBookingCost(_, {
          tourId,
          participants,
          departureDate,
        });

        // ✅ Create booking
        const result = await db.query(
          `INSERT INTO bookings (user_id, tour_id, departure_date, participants, total_cost, notes, booking_date, status, payment_status) 
           VALUES ($1, $2, $3::date, $4, $5, $6, CURRENT_TIMESTAMP, 'PENDING', 'PENDING') 
           RETURNING *`,
          [
            userId,
            tourId,
            departureDate,
            participants,
            calculation.totalCost,
            notes || `Booking for ${tour.name} in ${tour.location.city}`,
          ]
        );

        const booking = transformBooking(result.rows[0]);

        // ✅ Add tour info to response
        booking.tourInfo = {
          id: tour.id,
          name: tour.name,
          location: `${tour.location.city}, ${tour.location.country}`,
          priceAmount: tour.price.amount,
          currency: tour.price.currency,
        };

        console.log("✅ Booking created successfully:", {
          id: booking.id,
          tourName: tour.name,
          totalCost: booking.totalCost,
        });

        return booking;
      } catch (error) {
        console.error("❌ Create booking error:", error.message);
        throw new Error(`Failed to create booking: ${error.message}`);
      }
    },

    updateBooking: async (_, { id, input }) => {
      try {
        const { status, notes, paymentStatus } = input;
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (status !== undefined) {
          updates.push(`status = $${paramCount++}`);
          values.push(status);
        }
        if (notes !== undefined) {
          updates.push(`notes = $${paramCount++}`);
          values.push(notes);
        }
        if (paymentStatus !== undefined) {
          updates.push(`payment_status = $${paramCount++}`);
          values.push(paymentStatus);
        }

        if (updates.length === 0) {
          throw new Error("No fields to update");
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const query = `UPDATE bookings SET ${updates.join(
          ", "
        )} WHERE id = $${paramCount} RETURNING *`;

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
          throw new Error("Booking not found");
        }

        return transformBooking(result.rows[0]);
      } catch (error) {
        throw new Error(`Failed to update booking: ${error.message}`);
      }
    },

    cancelBooking: async (_, { id, reason }) => {
      try {
        const result = await db.query(
          "UPDATE bookings SET status = $1, notes = COALESCE(notes, '') || $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
          [
            "CANCELLED",
            reason ? `\nCancellation reason: ${reason}` : "\nCancelled by user",
            id,
          ]
        );

        if (result.rows.length === 0) {
          throw new Error("Booking not found");
        }

        return transformBooking(result.rows[0]);
      } catch (error) {
        throw new Error(`Failed to cancel booking: ${error.message}`);
      }
    },

    confirmBooking: async (_, { id }) => {
      try {
        const result = await db.query(
          "UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND status = $3 RETURNING *",
          ["CONFIRMED", id, "PENDING"]
        );

        if (result.rows.length === 0) {
          throw new Error("Booking not found or cannot be confirmed");
        }

        return transformBooking(result.rows[0]);
      } catch (error) {
        throw new Error(`Failed to confirm booking: ${error.message}`);
      }
    },
  },
};

// ✅ Transform booking function
function transformBooking(booking) {
  if (!booking) return null;

  try {
    return {
      id: booking.id,
      userId: booking.user_id,
      tourId: booking.tour_id,
      status: booking.status || "PENDING",
      departureDate: booking.departure_date.toISOString().split("T")[0],
      participants: booking.participants,
      totalCost: parseFloat(booking.total_cost),
      bookingDate: booking.booking_date.toISOString().split("T")[0],
      notes: booking.notes || "",
      paymentStatus: booking.payment_status || "PENDING",
      createdAt: booking.created_at.toISOString(),
      updatedAt: (booking.updated_at || booking.created_at).toISOString(),
    };
  } catch (error) {
    console.error("❌ Transform booking error:", error);
    throw new Error("Failed to transform booking data");
  }
}

module.exports = resolvers;
