-- Step 1: Create the Vault
CREATE DATABASE IF NOT EXISTS expedia_db;
USE expedia_db;

-- Step 2: Build the Structure
CREATE TABLE IF NOT EXISTS travel_deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination VARCHAR(100),
    price DECIMAL(10, 2),
    airline VARCHAR(50)
);

-- Step 3: Add the Data
INSERT INTO travel_deals (destination, price, airline) 
VALUES 
('Paris, France', 650.00, 'Air France'),
('Tokyo, Japan', 890.00, 'JAL'),
('London, UK', 550.00, 'British Airways');

-- Step 4: Show the Results
SELECT * FROM travel_deals;

-- Step 5: Create Users Table for Signup Data
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    createdAt DATETIME
);

-- Step 6: Insert Signup Data from JSON
INSERT INTO users (fullname, email, password, createdAt) 
VALUES 
('Daniel Little', 'dbl5605@psu.edu', 'test1', '2026-04-02 03:15:07');

-- Step 7: Show Users
SELECT * FROM users;

USE expedia_db;

-- This adds a specific column that understands JSON formatting
ALTER TABLE travel_deals 
ADD COLUMN raw_json_data JSON;

-- Step 8: Create Flight Searches Table
CREATE TABLE IF NOT EXISTS flight_searches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    search_params JSON,
    results_json LONGTEXT,
    itinerary_count INT DEFAULT 0,
    total_results INT DEFAULT 0,
    min_price DECIMAL(10, 2) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_search_params (search_params(100))
);

INSERT INTO users (fullname, email, password, createdAt) VALUES ('Test 2', 'test@test.com', 'pass1', '2026-04-03 00:22:26');

INSERT INTO users (fullname, email, password, createdAt) VALUES ('test 3', 'test3@test.com', 'test3', '2026-04-03 00:42:38');
