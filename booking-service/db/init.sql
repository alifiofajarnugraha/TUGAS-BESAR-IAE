CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,  -- ✅ Change from INTEGER to VARCHAR
    tour_id VARCHAR(50) NOT NULL,  -- ✅ Change from INTEGER to VARCHAR
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    departure_date DATE NOT NULL,
    participants INTEGER NOT NULL CHECK (participants > 0),
    total_cost DECIMAL(10,2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED', 'FAILED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_departure_date ON bookings(departure_date);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data untuk testing
INSERT INTO bookings (user_id, tour_id, status, departure_date, participants, total_cost, notes, payment_status) 
VALUES 
    ('USER001', 'TOUR001', 'CONFIRMED', '2024-03-15', 2, 2500000.00, 'Sample booking 1', 'PENDING'),
    ('USER002', 'TOUR002', 'PENDING', '2024-04-10', 4, 4800000.00, 'Sample booking 2', 'PENDING')
ON CONFLICT DO NOTHING;