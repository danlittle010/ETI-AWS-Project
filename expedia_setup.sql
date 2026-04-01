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

USE expedia_db;

-- This adds a specific column that understands JSON formatting
ALTER TABLE travel_deals 
ADD COLUMN raw_json_data JSON;