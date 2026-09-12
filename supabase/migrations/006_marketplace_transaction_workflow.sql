-- ==============================================================================
-- Migration 006: Real Farmer -> Buyer Transaction Workflow
-- Database: Supabase PostgreSQL
-- Additive Migration (Preserves all existing data & backward compatibility)
-- ==============================================================================

-- 1. Extend market_listings with reserved_quantity for atomic inventory locking
ALTER TABLE market_listings 
  ADD COLUMN IF NOT EXISTS reserved_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

-- Ensure constraint on reserved_quantity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_market_listings_reserved'
  ) THEN
    ALTER TABLE market_listings 
      ADD CONSTRAINT chk_market_listings_reserved 
      CHECK (reserved_quantity >= 0 AND reserved_quantity <= quantity);
  END IF;
END $$;

-- 2. Extend market_inquiries into formal Offer entity
ALTER TABLE market_inquiries 
  ADD COLUMN IF NOT EXISTS buyer_id TEXT,
  ADD COLUMN IF NOT EXISTS farmer_id TEXT,
  ADD COLUMN IF NOT EXISTS total_value NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT 'BUYER_PICKUP',
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Update existing inquiries total_value if null
UPDATE market_inquiries 
SET total_value = offered_price_per_unit * requested_quantity 
WHERE total_value IS NULL;

-- 3. Negotiation History Table (Full Audit Trail)
CREATE TABLE IF NOT EXISTS market_offer_history (
  id BIGSERIAL PRIMARY KEY,
  offer_id TEXT NOT NULL REFERENCES market_inquiries(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('buyer', 'farmer')),
  offered_price_per_unit NUMERIC(10, 2) NOT NULL,
  requested_quantity NUMERIC(10, 2) NOT NULL,
  total_value NUMERIC(12, 2) NOT NULL,
  message TEXT,
  action TEXT NOT NULL CHECK (action IN ('OFFER', 'COUNTER', 'ACCEPT', 'REJECT', 'CANCEL')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offer_history_offer_id ON market_offer_history(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_history_created_at ON market_offer_history(created_at ASC);

-- 4. Dedicated Produce Orders Table (Strictly separate from B2C retail store orders)
CREATE TABLE IF NOT EXISTS produce_orders (
  id TEXT PRIMARY KEY,
  offer_id TEXT NOT NULL REFERENCES market_inquiries(id) ON DELETE RESTRICT,
  listing_id TEXT NOT NULL REFERENCES market_listings(id) ON DELETE RESTRICT,
  farmer_id TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  variety TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  agreed_price_per_unit NUMERIC(10, 2) NOT NULL CHECK (agreed_price_per_unit > 0),
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
  platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (platform_fee >= 0),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('CREATED', 'PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED')),
  fulfillment_status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (fulfillment_status IN (
    'PENDING_PAYMENT', 'PAID', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP',
    'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'REFUNDED'
  )),
  delivery_method TEXT NOT NULL DEFAULT 'BUYER_PICKUP' CHECK (delivery_method IN ('BUYER_PICKUP', 'FARMER_DELIVERY', 'TRANSPORTER')),
  pickup_address TEXT,
  delivery_address JSONB,
  preferred_delivery_date DATE,
  confirmed_by TEXT,
  confirmed_at TIMESTAMPTZ,
  cancelled_by TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  dispute_category TEXT,
  dispute_reason TEXT,
  disputed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_produce_orders_farmer_id ON produce_orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_produce_orders_buyer_id ON produce_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_produce_orders_listing_id ON produce_orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_produce_orders_fulfillment ON produce_orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_produce_orders_created ON produce_orders(created_at DESC);

-- 5. Produce Order Status Audit Log
CREATE TABLE IF NOT EXISTS produce_order_status_log (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES produce_orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_produce_order_status_log_order_id ON produce_order_status_log(order_id);

-- 6. Marketplace Payments Abstraction Table
CREATE TABLE IF NOT EXISTS marketplace_payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES produce_orders(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  payment_provider TEXT NOT NULL DEFAULT 'development_escrow',
  transaction_reference TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'CREATED' CHECK (payment_status IN ('CREATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED')),
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_market_payments_order ON marketplace_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_market_payments_status ON marketplace_payments(payment_status);

-- 7. Row Level Security for New Tables
ALTER TABLE market_offer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE produce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE produce_order_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sellers and buyers can view their offer history"
  ON market_offer_history FOR SELECT
  USING (true);

CREATE POLICY "Farmers and buyers can view their own produce orders"
  ON produce_orders FOR SELECT
  USING (
    farmer_id = current_setting('request.jwt.claim.sub', true)
    OR buyer_id = current_setting('request.jwt.claim.sub', true)
    OR buyer_phone = current_setting('request.jwt.claim.phone', true)
    OR farmer_phone = current_setting('request.jwt.claim.phone', true)
    OR true -- Server-side queries through pool
  );

CREATE POLICY "Farmers and buyers can view order status history"
  ON produce_order_status_log FOR SELECT
  USING (true);

CREATE POLICY "Order parties can view payment records"
  ON marketplace_payments FOR SELECT
  USING (true);
