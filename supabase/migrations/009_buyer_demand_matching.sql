-- ==============================================================================
-- FarmDirect Migration 009: Buyer Demand & Farmer Matching System
-- ==============================================================================

-- 1. Buyer Profiles (Trust indicators & verification)
CREATE TABLE IF NOT EXISTS buyer_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_type TEXT NOT NULL, -- 'Agro Processing Mill', 'Spices & Oil Extraction', 'Grain Wholesaler', 'Exporter', 'Retail Supermarket Chain'
  verification_level TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_level IN ('UNVERIFIED', 'BASIC', 'VERIFIED', 'BUSINESS_VERIFIED')),
  gstin TEXT,
  pan TEXT,
  fssai_license TEXT,
  contact_person TEXT,
  purchasing_regions JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra']
  commodities_purchased JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ['comm-mirchi', 'comm-rice', 'comm-redgram']
  typical_monthly_volume NUMERIC(12, 2) DEFAULT 0.00,
  completed_transactions INTEGER NOT NULL DEFAULT 0,
  cancellation_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Buyer Demand Requests Table
CREATE TABLE IF NOT EXISTS buyer_demand_requests (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commodity_id TEXT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  variety_id TEXT REFERENCES commodity_varieties(id) ON DELETE SET NULL,
  grade_id TEXT REFERENCES commodity_grades(id) ON DELETE SET NULL,
  required_quantity NUMERIC(12, 2) NOT NULL CHECK (required_quantity > 0),
  quantity_unit TEXT NOT NULL DEFAULT 'Quintal',
  minimum_quantity NUMERIC(12, 2) NOT NULL DEFAULT 1.00 CHECK (minimum_quantity > 0),
  filled_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (filled_quantity >= 0),
  target_price_per_unit NUMERIC(12, 2) NOT NULL CHECK (target_price_per_unit > 0),
  maximum_price_per_unit NUMERIC(12, 2) NOT NULL CHECK (maximum_price_per_unit >= target_price_per_unit),
  required_from_date DATE NOT NULL,
  required_until_date DATE NOT NULL,
  delivery_location TEXT NOT NULL,
  delivery_latitude NUMERIC(10, 6),
  delivery_longitude NUMERIC(10, 6),
  delivery_radius_km INTEGER NOT NULL DEFAULT 100 CHECK (delivery_radius_km > 0),
  delivery_preference TEXT NOT NULL DEFAULT 'FARM_GATE_PICKUP' CHECK (delivery_preference IN ('FARM_GATE_PICKUP', 'DELIVERY_TO_WAREHOUSE', 'EITHER')),
  quality_requirements TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIALLY_FILLED', 'FILLED', 'EXPIRED', 'CANCELLED', 'PAUSED')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_demand_dates CHECK (required_until_date >= required_from_date),
  CONSTRAINT chk_demand_fill CHECK (filled_quantity <= required_quantity)
);

-- 3. Farmer Supply Profiles (Direct harvest availability representation)
CREATE TABLE IF NOT EXISTS farmer_supply_profiles (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commodity_id TEXT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  variety_id TEXT REFERENCES commodity_varieties(id) ON DELETE SET NULL,
  grade_id TEXT REFERENCES commodity_grades(id) ON DELETE SET NULL,
  total_harvest_quantity NUMERIC(12, 2) NOT NULL CHECK (total_harvest_quantity > 0),
  available_quantity NUMERIC(12, 2) NOT NULL CHECK (available_quantity >= 0),
  quantity_unit TEXT NOT NULL DEFAULT 'Quintal',
  expected_harvest_date DATE,
  available_from_date DATE NOT NULL,
  available_until_date DATE,
  farm_location TEXT NOT NULL,
  farm_latitude NUMERIC(10, 6),
  farm_longitude NUMERIC(10, 6),
  storage_available BOOLEAN NOT NULL DEFAULT false,
  storage_type TEXT, -- 'ON_FARM_GODOWN', 'COMMERCIAL_WAREHOUSE', 'COLD_STORAGE', 'OPEN_YARD'
  expected_price_per_unit NUMERIC(12, 2) NOT NULL CHECK (expected_price_per_unit > 0),
  minimum_acceptable_price NUMERIC(12, 2),
  preferred_market_radius_km INTEGER NOT NULL DEFAULT 150,
  quality_notes TEXT,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'COMMITTED', 'DEPLETED', 'ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Matching History (Ground-truth dataset for future ML ranking models)
CREATE TABLE IF NOT EXISTS match_history (
  id BIGSERIAL PRIMARY KEY,
  farmer_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  demand_request_id TEXT NOT NULL REFERENCES buyer_demand_requests(id) ON DELETE CASCADE,
  listing_id TEXT REFERENCES market_listings(id) ON DELETE SET NULL,
  supply_profile_id TEXT REFERENCES farmer_supply_profiles(id) ON DELETE SET NULL,
  score NUMERIC(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb, -- {'commodity': 25, 'quantity': 15, 'price': 18, 'distance': 14, 'timing': 10, 'quality': 9, 'reliability': 5}
  outcome TEXT NOT NULL DEFAULT 'VIEWED' CHECK (outcome IN ('VIEWED', 'CONTACTED', 'OFFER_SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Link market_inquiries (existing offers) to buyer_demand_requests
ALTER TABLE market_inquiries
  ADD COLUMN IF NOT EXISTS demand_request_id TEXT REFERENCES buyer_demand_requests(id) ON DELETE SET NULL;

-- 6. Indexes for High-Performance Matching & Filtering
CREATE INDEX IF NOT EXISTS idx_demand_commodity_status ON buyer_demand_requests(commodity_id, status);
CREATE INDEX IF NOT EXISTS idx_demand_buyer_id ON buyer_demand_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_demand_expires_at ON buyer_demand_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_demand_created_at ON buyer_demand_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_supply_farmer_commodity ON farmer_supply_profiles(farmer_id, commodity_id, status);
CREATE INDEX IF NOT EXISTS idx_supply_commodity_status ON farmer_supply_profiles(commodity_id, status);

CREATE INDEX IF NOT EXISTS idx_match_history_demand ON match_history(demand_request_id);
CREATE INDEX IF NOT EXISTS idx_match_history_farmer ON match_history(farmer_id);
CREATE INDEX IF NOT EXISTS idx_match_history_buyer ON match_history(buyer_id);
CREATE INDEX IF NOT EXISTS idx_match_history_outcome ON match_history(outcome);

CREATE INDEX IF NOT EXISTS idx_inquiries_demand_id ON market_inquiries(demand_request_id);
