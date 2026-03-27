-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(10) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- standard, deluxe, suite
  base_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'available', -- available, occupied, maintenance
  floor INTEGER,
  capacity INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- guests table
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  nationality VARCHAR(100),
  preferences TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled, refunded
  booking_source VARCHAR(50) DEFAULT 'direct', -- direct, booking.com, airbnb
  status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, checked_in, checked_out, cancelled
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, completed, failed, refunded
  gateway_reference VARCHAR(255),
  payment_method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- housekeeping_logs table
CREATE TABLE housekeeping_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL, -- clean, dirty, in_progress
  updated_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_check_out ON bookings(check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_housekeeping_room_id ON housekeeping_logs(room_id);
CREATE INDEX idx_housekeeping_created_at ON housekeeping_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: allow authenticated users full access
CREATE POLICY "Authenticated users can read rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete rooms"
  ON rooms FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read guests"
  ON guests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert guests"
  ON guests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update guests"
  ON guests FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete guests"
  ON guests FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete payments"
  ON payments FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read housekeeping_logs"
  ON housekeeping_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert housekeeping_logs"
  ON housekeeping_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update housekeeping_logs"
  ON housekeeping_logs FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete housekeeping_logs"
  ON housekeeping_logs FOR DELETE
  TO authenticated
  USING (true);

-- Also allow service role to bypass RLS for webhooks and server-side operations
CREATE POLICY "Service role bypass rooms"
  ON rooms FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role bypass guests"
  ON guests FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role bypass bookings"
  ON bookings FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role bypass payments"
  ON payments FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role bypass housekeeping_logs"
  ON housekeeping_logs FOR ALL
  TO service_role
  USING (true);
