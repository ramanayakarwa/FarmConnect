-- FarmConnect Database Schema
-- Users, Equipment and Bookings

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,

  name VARCHAR(100) NOT NULL,

  email VARCHAR(100) UNIQUE NOT NULL,

  phone VARCHAR(15),

  password VARCHAR(255) NOT NULL,

  role VARCHAR(20) NOT NULL DEFAULT 'farmer',

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT users_role_check
    CHECK (role IN ('farmer', 'provider'))
);


-- ============================================================
-- EQUIPMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,

  name VARCHAR(100) NOT NULL,

  category VARCHAR(50),

  description TEXT,

  image VARCHAR(500),

  price DECIMAL(10, 2) NOT NULL,

  location VARCHAR(100),

  availability BOOLEAN NOT NULL DEFAULT TRUE,

  rating DECIMAL(3, 2) NOT NULL DEFAULT 4.0,

  owner_id INT NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- BOOKINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,

  farmer_id INT NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  equipment_id INT NOT NULL
    REFERENCES equipment(id)
    ON DELETE CASCADE,

  start_date DATE NOT NULL,

  end_date DATE NOT NULL,

  land_size DECIMAL(8, 2),

  payment_method VARCHAR(20) NOT NULL DEFAULT 'cash',

  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT booking_status_check
    CHECK (
      status IN (
        'pending',
        'accepted',
        'rejected',
        'cancelled'
      )
    ),

  CONSTRAINT booking_payment_check
    CHECK (
      payment_method IN (
        'cash',
        'upi',
        'card',
        'bank_transfer'
      )
    ),

  CONSTRAINT booking_date_check
    CHECK (end_date >= start_date)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_equipment_owner
ON equipment(owner_id);

CREATE INDEX IF NOT EXISTS idx_equipment_category
ON equipment(category);

CREATE INDEX IF NOT EXISTS idx_equipment_location
ON equipment(location);

CREATE INDEX IF NOT EXISTS idx_equipment_availability
ON equipment(availability);

CREATE INDEX IF NOT EXISTS idx_bookings_farmer
ON bookings(farmer_id);

CREATE INDEX IF NOT EXISTS idx_bookings_equipment
ON bookings(equipment_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status
ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at
ON bookings(created_at);