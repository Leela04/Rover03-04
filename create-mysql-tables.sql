-- MySQL script to create all tables for Rover Management System

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  contact_person VARCHAR(100),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create rover_customer_matrix table
CREATE TABLE IF NOT EXISTS rover_customer_matrix (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rover_id VARCHAR(20) NOT NULL UNIQUE,
  rover_name VARCHAR(100) NOT NULL,
  customer_id INT NOT NULL,
  assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create rovers table
CREATE TABLE IF NOT EXISTS rovers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matrix_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  identifier VARCHAR(20) NOT NULL UNIQUE,
  connected BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'disconnected',
  battery_level INT DEFAULT 100,
  last_seen TIMESTAMP NULL,
  current_latitude FLOAT NULL,
  current_longitude FLOAT NULL,
  current_altitude FLOAT NULL,
  total_distance_traveled FLOAT DEFAULT 0,
  total_trips INT DEFAULT 0,
  ip_address VARCHAR(50) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rover_id INT NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  start_latitude FLOAT NULL,
  start_longitude FLOAT NULL,
  end_latitude FLOAT NULL,
  end_longitude FLOAT NULL,
  distance_traveled FLOAT DEFAULT 0,
  avg_speed FLOAT NULL,
  max_speed FLOAT NULL,
  status VARCHAR(20) DEFAULT 'in_progress',
  notes TEXT NULL
);

-- Create sensor_data table
CREATE TABLE IF NOT EXISTS sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rover_id INT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  temperature FLOAT NULL,
  humidity FLOAT NULL,
  pressure FLOAT NULL,
  altitude FLOAT NULL,
  heading FLOAT NULL,
  speed FLOAT NULL,
  tilt FLOAT NULL,
  latitude FLOAT NULL,
  longitude FLOAT NULL,
  battery_level INT NULL,
  signal_strength INT NULL,
  trip_id INT NULL
);

-- Create command_logs table
CREATE TABLE IF NOT EXISTS command_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rover_id INT NOT NULL,
  command VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  response TEXT NULL,
  user_id INT NULL,
  trip_id INT NULL
);

-- Create rover_clients table
CREATE TABLE IF NOT EXISTS rover_clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rover_id INT NOT NULL,
  connected BOOLEAN DEFAULT FALSE,
  last_ping TIMESTAMP NULL,
  socket_id VARCHAR(255) NULL,
  connect_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  disconnect_time TIMESTAMP NULL
);

-- Add indexes for better performance
CREATE INDEX idx_rover_customer_matrix_customer_id ON rover_customer_matrix(customer_id);
CREATE INDEX idx_rovers_matrix_id ON rovers(matrix_id);
CREATE INDEX idx_trips_rover_id ON trips(rover_id);
CREATE INDEX idx_sensor_data_rover_id ON sensor_data(rover_id);
CREATE INDEX idx_sensor_data_trip_id ON sensor_data(trip_id);
CREATE INDEX idx_command_logs_rover_id ON command_logs(rover_id);
CREATE INDEX idx_rover_clients_rover_id ON rover_clients(rover_id);