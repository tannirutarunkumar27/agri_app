-- ==============================================================================
-- Migration 007: Logistics & Transporter Marketplace
-- Database: Supabase PostgreSQL
-- Additive Migration (Preserves all existing data & backward compatibility)
-- ==============================================================================

-- 1. Transporters Table
CREATE TABLE IF NOT EXISTS transporters (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  carrying_capacity NUMERIC(10, 2) NOT NULL CHECK (carrying_capacity > 0),
  capacity_unit TEXT NOT NULL DEFAULT 'Quintal',
  service_area JSONB DEFAULT '[]'::jsonb,
  base_location TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'SUSPENDED')),
  rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
  total_completed_jobs INTEGER NOT NULL DEFAULT 0 CHECK (total_completed_jobs >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transporters_user_id ON transporters(user_id);
CREATE INDEX IF NOT EXISTS idx_transporters_phone ON transporters(phone);
CREATE INDEX IF NOT EXISTS idx_transporters_status ON transporters(verification_status, is_active);

-- 2. Transporter Vehicles (Multi-vehicle Fleet support)
CREATE TABLE IF NOT EXISTS transporter_vehicles (
  id TEXT PRIMARY KEY,
  transporter_id TEXT NOT NULL REFERENCES transporters(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  capacity NUMERIC(10, 2) NOT NULL CHECK (capacity > 0),
  capacity_unit TEXT NOT NULL DEFAULT 'Quintal',
  refrigeration_available BOOLEAN NOT NULL DEFAULT false,
  vehicle_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (vehicle_status IN ('ACTIVE', 'IN_TRANSIT', 'MAINTENANCE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicles_transporter ON transporter_vehicles(transporter_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON transporter_vehicles(vehicle_status);

-- 3. Delivery Jobs Table
CREATE TABLE IF NOT EXISTS delivery_jobs (
  id TEXT PRIMARY KEY,
  produce_order_id TEXT NOT NULL REFERENCES produce_orders(id) ON DELETE CASCADE,
  transporter_id TEXT REFERENCES transporters(id) ON DELETE SET NULL,
  assigned_vehicle_id TEXT REFERENCES transporter_vehicles(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  delivery_location JSONB NOT NULL,
  cargo_crop_name TEXT NOT NULL,
  cargo_quantity NUMERIC(10, 2) NOT NULL CHECK (cargo_quantity > 0),
  cargo_unit TEXT NOT NULL,
  pickup_date DATE,
  expected_delivery_date DATE,
  actual_pickup_at TIMESTAMPTZ,
  actual_delivery_at TIMESTAMPTZ,
  distance_km NUMERIC(8, 2) NOT NULL DEFAULT 50.00 CHECK (distance_km >= 0),
  estimated_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (estimated_cost >= 0),
  agreed_cost NUMERIC(10, 2) CHECK (agreed_cost IS NULL OR agreed_cost >= 0),
  delivery_status TEXT NOT NULL DEFAULT 'OPEN' CHECK (delivery_status IN (
    'OPEN', 'QUOTED', 'ASSIGNED', 'ACCEPTED', 'DRIVER_ASSIGNED',
    'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'
  )),
  special_requirements TEXT,
  refrigeration_required BOOLEAN NOT NULL DEFAULT false,
  pickup_notes TEXT,
  delivery_notes TEXT,
  proof_of_delivery_url TEXT,
  proof_uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_jobs_order ON delivery_jobs(produce_order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_jobs_transporter ON delivery_jobs(transporter_id);
CREATE INDEX IF NOT EXISTS idx_delivery_jobs_status ON delivery_jobs(delivery_status);
CREATE INDEX IF NOT EXISTS idx_delivery_jobs_created ON delivery_jobs(created_at DESC);

-- 4. Delivery Bids (Transporter Quotes)
CREATE TABLE IF NOT EXISTS delivery_bids (
  id TEXT PRIMARY KEY,
  delivery_job_id TEXT NOT NULL REFERENCES delivery_jobs(id) ON DELETE CASCADE,
  transporter_id TEXT NOT NULL REFERENCES transporters(id) ON DELETE CASCADE,
  proposed_cost NUMERIC(10, 2) NOT NULL CHECK (proposed_cost > 0),
  estimated_pickup_time TEXT,
  estimated_delivery_time TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_bids_job ON delivery_bids(delivery_job_id);
CREATE INDEX IF NOT EXISTS idx_delivery_bids_transporter ON delivery_bids(transporter_id);
CREATE INDEX IF NOT EXISTS idx_delivery_bids_status ON delivery_bids(status);

-- 5. Delivery Status Audit Log
CREATE TABLE IF NOT EXISTS delivery_status_log (
  id BIGSERIAL PRIMARY KEY,
  delivery_job_id TEXT NOT NULL REFERENCES delivery_jobs(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_status_log_job ON delivery_status_log(delivery_job_id);

-- 6. Transporter Ratings
CREATE TABLE IF NOT EXISTS transporter_ratings (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES produce_orders(id) ON DELETE CASCADE,
  delivery_job_id TEXT NOT NULL REFERENCES delivery_jobs(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('buyer', 'farmer')),
  transporter_id TEXT NOT NULL REFERENCES transporters(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_transporter_rating_per_reviewer UNIQUE (delivery_job_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_transporter_ratings_transporter ON transporter_ratings(transporter_id);

-- 7. Enable RLS
ALTER TABLE transporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE transporter_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE transporter_ratings ENABLE ROW LEVEL SECURITY;

-- Permissive policies for serverless pooled execution
CREATE POLICY "Transporters visible to authenticated users" ON transporters FOR SELECT USING (true);
CREATE POLICY "Transporter vehicles visible" ON transporter_vehicles FOR SELECT USING (true);
CREATE POLICY "Delivery jobs visible" ON delivery_jobs FOR SELECT USING (true);
CREATE POLICY "Delivery bids visible" ON delivery_bids FOR SELECT USING (true);
CREATE POLICY "Delivery status log visible" ON delivery_status_log FOR SELECT USING (true);
CREATE POLICY "Transporter ratings visible" ON transporter_ratings FOR SELECT USING (true);
