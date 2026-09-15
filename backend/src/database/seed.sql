-- FarmConnect Seed Data
-- Run schema.sql first, then this file

-- Clear existing data (in reverse FK order)
TRUNCATE bookings, equipment, users RESTART IDENTITY CASCADE;

-- =========================================================
-- USERS
-- Password hash corresponds to 'password123' (bcrypt rounds=10)
-- =========================================================

-- Providers
INSERT INTO users (name, email, phone, password, role) VALUES
  ('Amit Agro Services',    'rajesh@provider.com', '9876543210', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'provider'),
  ('Green Farm Equipment',  'sunita@provider.com', '9876543211', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'provider');

-- Farmers
INSERT INTO users (name, email, phone, password, role) VALUES
  ('Amit Singh',     'amit@farmer.com',     '9876543212', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer'),
  ('Priya Sharma',   'priya@farmer.com',    '9876543213', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer');

-- =========================================================
-- EQUIPMENT (owner_id references the two providers above)
-- =========================================================

INSERT INTO equipment (name, category, description, image, price, location, availability, rating, owner_id) VALUES
  (
    'Tractor 45 HP',
    'Tractor',
    'Powerful 45 HP tractor suitable for all types of farm work including ploughing, harrowing, and transportation. Well-maintained with GPS tracking.',
    'https://images.unsplash.com/photo-1605338803939-52a14d0c8bca?w=400',
    1200.00,
    'Pune',
    TRUE,
    4.5,
    1
  ),
  (
    'Rotavator',
    'Tillage',
    'Heavy-duty rotavator for soil preparation. Ideal for breaking up clods and mixing crop residue into the soil. Compatible with 35-55 HP tractors.',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
    800.00,
    'Nashik',
    TRUE,
    4.2,
    1
  ),
  (
    'Seed Drill',
    'Sowing',
    'Multi-crop seed drill for accurate and uniform seed placement. Adjustable seed rate and row spacing. Suitable for wheat, soybean, and pulses.',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    600.00,
    'Jalgaon',
    TRUE,
    4.3,
    2
  ),
  (
    'Boom Sprayer',
    'Sprayer',
    '12-metre boom sprayer with 400-litre tank. GPS-controlled for precise chemical application. Reduces chemical wastage by up to 30%.',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    500.00,
    'Sangli',
    TRUE,
    4.1,
    2
  );