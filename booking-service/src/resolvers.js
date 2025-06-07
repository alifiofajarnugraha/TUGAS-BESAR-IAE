const db = require('./db');

const resolvers = {
    Query: {
        getBooking: async (_, { id }) => {
            const result = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
            return transformBooking(result.rows[0]);
        },
        getUserBookings: async (_, { userId }) => {
            const result = await db.query('SELECT * FROM bookings WHERE user_id = $1', [userId]);
            return result.rows.map(transformBooking);
        },
    },
    Mutation: {
        createBooking: async (_, { input }) => {
            const { userId, tourId, departureDate, totalCost } = input;
            const result = await db.query(
                'INSERT INTO bookings (user_id, tour_id, status, departure_date, total_cost) VALUES ($1, $2, $3, $4::date, $5) RETURNING *',
                [userId, tourId, 'PENDING', departureDate, totalCost]
            );
            return transformBooking(result.rows[0]);
        },
        updateBookingStatus: async (_, { id, status }) => {
            const result = await db.query(
                'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
                [status, id]
            );
            if (result.rows[0]) {
                return transformBooking(result.rows[0]);
            }
            throw new Error('Booking not found');
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
        // Format tanggal ke YYYY-MM-DD
        departureDate: booking.departure_date.toISOString().split('T')[0],
        totalCost: booking.total_cost
    };
}

module.exports = resolvers;