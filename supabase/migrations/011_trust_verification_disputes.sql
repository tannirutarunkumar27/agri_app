-- ==============================================================================
-- FarmDirect Migration 011: Trust, Quality, Verification & Dispute Management Layer
-- Database: Supabase PostgreSQL / Neon PostgreSQL
-- ==============================================================================

-- 1. Extend Users table with Verification Level & Trust Score metrics
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verification_level TEXT NOT NULL DEFAULT 'UNVERIFIED',
  ADD COLUMN IF NOT EXISTS trust_score INTEGER NOT NULL DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  ADD COLUMN IF NOT EXISTS trust_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Ensure constraint on verification_level for users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_verification_level'
  ) THEN
    ALTER TABLE users 
      ADD CONSTRAINT chk_users_verification_level 
      CHECK (verification_level IN (
        'UNVERIFIED', 'PHONE_VERIFIED', 'BASIC_VERIFIED', 'BUSINESS_VERIFIED',
        'DOCUMENT_VERIFIED', 'VEHICLE_VERIFIED', 'FULLY_VERIFIED'
      ));
  END IF;
END $$;

-- 2. Reusable Verification Entity (Farmer, Buyer, Transporter)
CREATE TABLE IF NOT EXISTS user_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL CHECK (user_role IN ('farmer', 'buyer', 'transporter', 'retailer', 'admin')),
  verification_type TEXT NOT NULL, -- 'AADHAAR', 'PAN', 'GSTIN', 'FSSAI_LICENSE', 'MANDI_TRADER_LICENSE', 'LAND_RECORD_7_12', 'VEHICLE_RC', 'DRIVING_LICENSE', 'BANK_ACCOUNT'
  submitted_level TEXT NOT NULL, -- Target level requested
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'SUSPENDED')),
  document_reference TEXT, -- Storage bucket object path or secure external ref
  document_metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- Document number, issuing authority, checksum
  rejection_reason TEXT,
  notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_verifications_user ON user_verifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_verifications_status ON user_verifications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_verifications_role ON user_verifications(user_role, status);

-- 3. Produce Quality & Quantity Verification Records
CREATE TABLE IF NOT EXISTS produce_quality_records (
  id TEXT PRIMARY KEY,
  lot_id TEXT NOT NULL, -- e.g. 'FD-RG-2026-000184'
  listing_id TEXT REFERENCES market_listings(id) ON DELETE SET NULL,
  order_id TEXT REFERENCES produce_orders(id) ON DELETE SET NULL,
  commodity_id TEXT REFERENCES commodities(id) ON DELETE SET NULL,
  commodity_name TEXT NOT NULL,
  variety_id TEXT REFERENCES commodity_varieties(id) ON DELETE SET NULL,
  variety_name TEXT,
  grade TEXT NOT NULL,
  moisture NUMERIC(5, 2),
  declared_quantity NUMERIC(10, 2) NOT NULL CHECK (declared_quantity > 0),
  confirmed_quantity NUMERIC(10, 2) CHECK (confirmed_quantity IS NULL OR confirmed_quantity >= 0),
  delivered_quantity NUMERIC(10, 2) CHECK (delivered_quantity IS NULL OR delivered_quantity >= 0),
  quantity_unit TEXT NOT NULL DEFAULT 'Quintal',
  quality_attributes JSONB NOT NULL DEFAULT '{}'::jsonb, -- Commodity-specific (broken %, grain length, foreign matter, color, defect %)
  inspection_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (inspection_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'CONDITIONAL')),
  inspection_source TEXT NOT NULL DEFAULT 'SELF_DECLARED' CHECK (inspection_source IN ('SELF_DECLARED', 'BUYER_VERIFIED', 'PLATFORM_VERIFIED', 'THIRD_PARTY_VERIFIED')),
  inspected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  inspector_id TEXT,
  inspector_name TEXT,
  evidence_reference TEXT,
  notes TEXT,
  weighbridge_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- { gross_weight, tare_weight, net_weight, weighing_timestamp, weighbridge_name, receipt_number, receipt_document }
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pqr_lot_id ON produce_quality_records(lot_id);
CREATE INDEX IF NOT EXISTS idx_pqr_listing ON produce_quality_records(listing_id);
CREATE INDEX IF NOT EXISTS idx_pqr_order ON produce_quality_records(order_id);
CREATE INDEX IF NOT EXISTS idx_pqr_status ON produce_quality_records(inspection_status);
CREATE INDEX IF NOT EXISTS idx_pqr_source ON produce_quality_records(inspection_source);

-- 4. Formal Dispute Management Entity
CREATE TABLE IF NOT EXISTS disputes (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES produce_orders(id) ON DELETE RESTRICT,
  initiated_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  respondent_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category TEXT NOT NULL CHECK (category IN (
    'QUALITY_MISMATCH', 'QUANTITY_MISMATCH', 'DAMAGE',
    'DELIVERY_DELAY', 'PAYMENT', 'PRODUCT_NOT_RECEIVED', 'OTHER'
  )),
  description TEXT NOT NULL,
  claimed_amount NUMERIC(12, 2) NOT NULL CHECK (claimed_amount >= 0),
  refund_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (refund_amount >= 0),
  settlement_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (settlement_amount >= 0),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
    'OPEN', 'UNDER_REVIEW', 'WAITING_FOR_EVIDENCE', 'MEDIATION', 'RESOLVED', 'REJECTED', 'ESCALATED'
  )),
  priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'HIGH', 'CRITICAL')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_at TIMESTAMPTZ NOT NULL, -- SLA based on priority (12h, 24h, 48h)
  resolved_at TIMESTAMPTZ,
  resolution JSONB NOT NULL DEFAULT '{}'::jsonb, -- { decision, refund_to_buyer, release_to_farmer, reason, admin_notes }
  reviewer_id TEXT,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_order_active_dispute UNIQUE (order_id) -- Only 1 active dispute per order
);

CREATE INDEX IF NOT EXISTS idx_disputes_order ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_priority_due ON disputes(priority, due_at ASC);
CREATE INDEX IF NOT EXISTS idx_disputes_initiated_by ON disputes(initiated_by);
CREATE INDEX IF NOT EXISTS idx_disputes_respondent ON disputes(respondent_id);

-- 5. Dispute Evidence Store (Immutable)
CREATE TABLE IF NOT EXISTS dispute_evidence (
  id BIGSERIAL PRIMARY KEY,
  dispute_id TEXT NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  uploader_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  uploader_role TEXT NOT NULL CHECK (uploader_role IN ('buyer', 'farmer', 'transporter', 'admin')),
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'PHOTO', 'DELIVERY_RECEIPT', 'WEIGHBRIDGE_RECEIPT',
    'QUALITY_REPORT', 'MESSAGE', 'INVOICE', 'OTHER'
  )),
  reference_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispute_evidence_dispute ON dispute_evidence(dispute_id, created_at ASC);

-- 6. Transaction Risk Flags
CREATE TABLE IF NOT EXISTS transaction_risk_flags (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT REFERENCES produce_orders(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  listing_id TEXT REFERENCES market_listings(id) ON DELETE SET NULL,
  rule_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  explanation TEXT NOT NULL,
  detected_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  dismissed_by TEXT,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risk_flags_order ON transaction_risk_flags(order_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_user ON transaction_risk_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_severity ON transaction_risk_flags(severity, is_dismissed);

-- 7. Immutable Trust Audit Log
CREATE TABLE IF NOT EXISTS trust_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL, -- 'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'DISPUTE_OPENED', 'DISPUTE_RESOLVED', 'ESCROW_FROZEN', 'ESCROW_SETTLED', 'QUALITY_VERIFIED', 'RISK_FLAG_GENERATED'
  entity TEXT NOT NULL, -- 'USER_VERIFICATION', 'DISPUTE', 'PRODUCE_ORDER', 'QUALITY_RECORD'
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trust_audit_entity ON trust_audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_trust_audit_actor ON trust_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_trust_audit_time ON trust_audit_logs(created_at DESC);

-- 8. Enable Row Level Security
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE produce_quality_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive policies for serverless pool
CREATE POLICY "user_verifications_read" ON user_verifications FOR SELECT USING (true);
CREATE POLICY "produce_quality_records_read" ON produce_quality_records FOR SELECT USING (true);
CREATE POLICY "disputes_read" ON disputes FOR SELECT USING (true);
CREATE POLICY "dispute_evidence_read" ON dispute_evidence FOR SELECT USING (true);
CREATE POLICY "transaction_risk_flags_read" ON transaction_risk_flags FOR SELECT USING (true);
CREATE POLICY "trust_audit_logs_read" ON trust_audit_logs FOR SELECT USING (true);

-- 9. Seed Representative Initial Verification & Quality Records (safe conditional check)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE id = 'farmer-demo') THEN
    INSERT INTO user_verifications (
      id, user_id, user_role, verification_type, submitted_level, status, document_reference, document_metadata, notes
    ) VALUES (
      'verif-farmer-01',
      'farmer-demo',
      'farmer',
      'LAND_RECORD_7_12',
      'FULLY_VERIFIED',
      'APPROVED',
      'documents/farmers/7_12_extract_pune_land.pdf',
      '{"survey_number": "42/1B", "village": "Shirur", "acres": 4.5, "verified_officer": "Talathi Desk"}'::jsonb,
      'Land 7/12 record and Aadhaar verified at Haveli APMC office.'
    ) ON CONFLICT (id) DO NOTHING;

    UPDATE users SET verification_level = 'FULLY_VERIFIED', trust_score = 92, trust_breakdown = '{"verification": 25, "orders": 24, "rating": 15, "tenure": 10, "disputes_penalty": 0}'::jsonb
    WHERE id = 'farmer-demo';
  END IF;

  IF EXISTS (SELECT 1 FROM users WHERE id = 'usr-buyer-agro') THEN
    INSERT INTO user_verifications (
      id, user_id, user_role, verification_type, submitted_level, status, document_reference, document_metadata, notes
    ) VALUES (
      'verif-buyer-01',
      'usr-buyer-agro',
      'buyer',
      'GSTIN',
      'BUSINESS_VERIFIED',
      'APPROVED',
      'documents/buyers/gstin_certificate_pune.pdf',
      '{"gstin": "27AABCP1234F1Z8", "business_name": "Venkatesh Agro Industries", "taxpayer_type": "Regular"}'::jsonb,
      'Active GSTIN registration and FSSAI commercial food license verified.'
    ) ON CONFLICT (id) DO NOTHING;

    UPDATE users SET verification_level = 'BUSINESS_VERIFIED', trust_score = 88, trust_breakdown = '{"verification": 20, "orders": 22, "rating": 14, "tenure": 8, "disputes_penalty": 0}'::jsonb
    WHERE id = 'usr-buyer-agro';
  END IF;
END $$;
