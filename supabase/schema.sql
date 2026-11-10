-- SUPABASE DATABASE SETUP FOR ROOMIGO
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student',
  hostel_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hostels table
CREATE TABLE IF NOT EXISTS hostels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  price INTEGER DEFAULT 0,
  dist DECIMAL(3,1) DEFAULT 1,
  rooms TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  available INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  photos TEXT[] DEFAULT '{}',
  room_photos JSONB DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  manager_id UUID REFERENCES profiles(id),
  manager_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  hostel_id INTEGER NOT NULL REFERENCES hostels(id),
  user_id UUID REFERENCES profiles(id),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  room TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Hostels policies
CREATE POLICY "Anyone can view hostels" ON hostels FOR SELECT USING (true);
CREATE POLICY "Managers can update own hostel" ON hostels FOR UPDATE USING (auth.uid() = manager_id);
CREATE POLICY "Admins manage hostels" ON hostels FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Enquiries policies
CREATE POLICY "View own enquiries" ON enquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Managers view hostel enquiries" ON enquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM hostels WHERE hostels.id = enquiries.hostel_id AND hostels.manager_id = auth.uid())
);
CREATE POLICY "Admins view all enquiries" ON enquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Students create enquiries" ON enquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Managers update status" ON enquiries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM hostels WHERE hostels.id = enquiries.hostel_id AND hostels.manager_id = auth.uid())
);

-- Banners policies
CREATE POLICY "View active banners" ON banners FOR SELECT USING (active = true);
CREATE POLICY "Admins manage banners" ON banners FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed sample hostels (optional)
INSERT INTO hostels (name, area, price, dist, rooms, amenities, available, description)
SELECT * FROM (VALUES
  ('Akwaaba Court', 'Ayeduase', 6500, 1.2, ARRAY['1-in-a-room', '2-in-a-room'], ARRAY['Wi-Fi', 'Water', 'Security', 'Generator'], 12, 'Quiet, modern hostel near main gate.'),
  ('Oak Ridge Lodge', 'Kentinkrono', 4800, 2.5, ARRAY['2-in-a-room', '4-in-a-room'], ARRAY['Water', 'Kitchen', 'Study room'], 5, 'Budget friendly with shared kitchen.'),
  ('Unity Heights', 'Bomso', 5600, 1.8, ARRAY['1-in-a-room', '2-in-a-room', '4-in-a-room'], ARRAY['Wi-Fi', 'Water', 'Kitchen', 'Security'], 0, 'Popular with continuing students.'),
  ('Sunrise Suites', 'Ayeduase', 8200, 0.8, ARRAY['1-in-a-room'], ARRAY['Wi-Fi', 'Water', 'Security', 'Generator', 'Study room'], 3, 'Premium single rooms closest to campus.'),
  ('Green Valley Hostel', 'Boadi', 4200, 3.4, ARRAY['2-in-a-room', '4-in-a-room'], ARRAY['Water', 'Security'], 20, 'Affordable with nearby transport.'),
  ('Cedar Point', 'Bomso', 7000, 1.5, ARRAY['1-in-a-room', '2-in-a-room'], ARRAY['Wi-Fi', 'Water', 'Kitchen', 'Generator'], 7, 'Self-contained with reliable power.')
) AS v(name, area, price, dist, rooms, amenities, available, description)
WHERE NOT EXISTS (SELECT 1 FROM hostels LIMIT 1);
