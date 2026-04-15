-- Drop the database if it exists to ensure idempotency
DROP DATABASE IF EXISTS travel_aggregator;
CREATE DATABASE travel_aggregator;
USE travel_aggregator;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create travel_deals table
CREATE TABLE IF NOT EXISTS travel_deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    airline VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL
);

-- Create saved_deals junction table
CREATE TABLE IF NOT EXISTS saved_deals (
    user_id INT,
    travel_deal_id INT,
    PRIMARY KEY (user_id, travel_deal_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (travel_deal_id) REFERENCES travel_deals(id) ON DELETE CASCADE
);

-- Create a dedicated user with least privilege
CREATE USER 'expedia_app'@'localhost' IDENTIFIED BY 'your_password'; -- Replace 'your_password' with a secure password
GRANT SELECT, INSERT, UPDATE ON travel_aggregator.* TO 'expedia_app'@'localhost';

-- Insert mock data into users table
INSERT INTO users (fullname, email, password) VALUES
('Daniel Little', 'daniel.little@example.com', 'password1'),
('Ethan Tel', 'ethan.tel@example.com', 'password2'),
('Lucas Herskovits', 'lucas.herskovits@example.com', 'password3');

-- Insert mock data into travel_deals table
INSERT INTO travel_deals (destination, price, airline, region) VALUES
('Paris, France', 299.99, 'Air France', 'Europe'),
('Tokyo, Japan', 599.99, 'Japan Airlines', 'Asia'),
('New York, USA', 199.99, 'Delta Airlines', 'North America'),
('London, UK', 350.00, 'British Airways', 'Europe'),
('Bangkok, Thailand', 450.00, 'Thai Airways', 'Asia'),
('Toronto, Canada', 299.00, 'Air Canada', 'North America'),
('Rome, Italy', 400.00, 'Alitalia', 'Europe'),
('Beijing, China', 600.00, 'China Eastern', 'Asia'),
('Miami, USA', 150.00, 'American Airlines', 'North America'),
('Berlin, Germany', 350.00, 'Lufthansa', 'Europe');

-- Simulate saved searches by linking users to travel deals
INSERT INTO saved_deals (user_id, travel_deal_id) VALUES
(1, 1), -- Daniel saves Paris deal
(1, 3), -- Daniel saves New York deal
(2, 2), -- Ethan saves Tokyo deal
(2, 4), -- Ethan saves London deal
(3, 5), -- Lucas saves Bangkok deal
(3, 6); -- Lucas saves Toronto deal

-- Query to sort all travel deals by price (ASC)
SELECT * FROM travel_deals ORDER BY price ASC;

-- Complex JOIN query for a specific user's profile view
SELECT 
    u.fullname,
    td.id AS travel_deal_id,
    td.destination,
    td.price,
    td.airline,
    td.region
FROM 
    users u
JOIN 
    saved_deals sd ON u.id = sd.user_id
JOIN 
    travel_deals td ON sd.travel_deal_id = td.id
WHERE 
    u.id = 1; -- Change this ID to get the profile view of another user