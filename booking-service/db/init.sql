CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    tour_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    departure_date DATE NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL
);