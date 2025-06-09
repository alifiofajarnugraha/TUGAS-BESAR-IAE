const db = require("./db");

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
        "SELECT * FROM bookings WHERE departure_date BETWEEN $1 AND $2 ORDER BY departure_date",
        [startDate, endDate]
      );
      return result.rows.map(transformBooking);
    },

    calculateBookingCost: async (
      _,
      { tourId, participants, departureDate }
    ) => {
      try {
        // Fetch tour details (you might need to call tour service here)
        const basePrice = 1000000; // IDR - This should come from tour service
        const subtotal = basePrice * participants;
        const tax = subtotal * 0.1; // 10% tax
        const discount = participants >= 5 ? subtotal * 0.05 : 0; // 5% discount for groups
        const totalCost = subtotal + tax - discount;

        return {
          basePrice,
          participants,
          subtotal,
          tax,
          discount,
          totalCost,
          breakdown: [
            {
              item: "Base Price per Person",
              amount: basePrice,
              quantity: participants,
            },
            { item: "Tax (10%)", amount: tax, quantity: 1 },
            ...(discount > 0
              ? [
                  {
                    item: "Group Discount (5%)",
                    amount: -discount,
                    quantity: 1,
                  },
                ]
              : []),
          ],
        };
      } catch (error) {
        throw new Error(`Failed to calculate booking cost: ${error.message}`);
      }
    },
  },

  Mutation: {
    createBooking: async (_, { input }) => {
      try {
        const { userId, tourId, departureDate, participants, notes } = input;

        // Calculate total cost
        const calculation = await resolvers.Query.calculateBookingCost(_, {
          tourId,
          participants,
          departureDate,
        });

        const result = await db.query(
          `INSERT INTO bookings (user_id, tour_id, departure_date, participants, total_cost, notes, booking_date) 
                     VALUES ($1, $2, $3::date, $4, $5, $6, CURRENT_TIMESTAMP) 
                     RETURNING *`,
          [
            userId,
            tourId,
            departureDate,
            participants,
            calculation.totalCost,
            notes,
          ]
        );

        return transformBooking(result.rows[0]);
      } catch (error) {
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
          "UPDATE bookings SET status = $1, notes = COALESCE(notes, '') || $2 WHERE id = $3 RETURNING *",
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
          "UPDATE bookings SET status = $1 WHERE id = $2 AND status = $3 RETURNING *",
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

// Helper function untuk transform dari snake_case ke camelCase
function transformBooking(booking) {
  if (!booking) return null;
  return {
    id: booking.id,
    userId: booking.user_id,
    tourId: booking.tour_id,
    status: booking.status,
    departureDate: booking.departure_date.toISOString().split("T")[0],
    participants: booking.participants,
    totalCost: parseFloat(booking.total_cost),
    bookingDate: booking.booking_date.toISOString().split("T")[0],
    notes: booking.notes,
    paymentStatus: booking.payment_status,
    createdAt: booking.created_at.toISOString(),
    updatedAt: booking.updated_at.toISOString(),
  };
}

module.exports = resolvers;
