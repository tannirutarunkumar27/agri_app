-- ==============================================================================
-- FarmDirect Migration 008: Market Intelligence & Commodity Management Master
-- ==============================================================================

-- 1. Commodity Master
CREATE TABLE IF NOT EXISTS commodities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  local_names JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"hi": "मिर्च", "te": "మిర్చి", "kn": "ಮೆಣಸಿನಕಾಯಿ", "mr": "मिरची", "ta": "மிளகாய்"}
  category TEXT NOT NULL, -- e.g. 'spices', 'cereals', 'pulses', 'oilseeds', 'vegetables', 'fruits', 'cash_crops'
  default_unit TEXT NOT NULL DEFAULT 'Quintal',
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Variety Master
CREATE TABLE IF NOT EXISTS commodity_varieties (
  id TEXT PRIMARY KEY,
  commodity_id TEXT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  aliases JSONB NOT NULL DEFAULT '[]'::jsonb, -- Alternative names used across regional mandis
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_commodity_variety UNIQUE(commodity_id, name)
);

-- 3. Grade Master
CREATE TABLE IF NOT EXISTS commodity_grades (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Measurement Unit Master
CREATE TABLE IF NOT EXISTS measurement_units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  to_base_multiplier NUMERIC(12, 4) NOT NULL, -- Conversion to base unit Quintal (1 Quintal = 1.0, 1 Kg = 0.01, 1 Tonne = 10.0, 1 Bag 50kg = 0.5)
  base_unit TEXT NOT NULL DEFAULT 'Quintal',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Mandi / Market Master
CREATE TABLE IF NOT EXISTS markets (
  id TEXT PRIMARY KEY,
  market_name TEXT NOT NULL,
  mandi_code TEXT UNIQUE,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  market_type TEXT NOT NULL DEFAULT 'APMC_PRINCIPAL', -- 'APMC_PRINCIPAL', 'APMC_SUB_YARD', 'PRIVATE_MANDI', 'ELECTRONIC_E_NAM'
  is_active BOOLEAN NOT NULL DEFAULT true,
  data_source TEXT NOT NULL DEFAULT 'AGMARKNET_DMI',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_market_state_district_name UNIQUE(state, district, market_name)
);

-- 6. Commodity-Market Mapping
CREATE TABLE IF NOT EXISTS commodity_market_mappings (
  id TEXT PRIMARY KEY,
  commodity_id TEXT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  variety_id TEXT REFERENCES commodity_varieties(id) ON DELETE SET NULL,
  market_id TEXT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  accepted_grade TEXT DEFAULT 'FAQ',
  unit TEXT NOT NULL DEFAULT 'Quintal',
  source TEXT NOT NULL DEFAULT 'AGMARKNET_DMI',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_commodity_market_mapping UNIQUE(commodity_id, market_id, variety_id)
);

-- 7. Raw Market Price Ingestion Table (Raw Audit Provenance)
CREATE TABLE IF NOT EXISTS market_prices_raw (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'AGMARKNET_DMI',
  raw_payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'VALID', -- 'VALID', 'REJECTED', 'NEEDS_REVIEW'
  rejection_reason TEXT,
  error_details JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Normalized Historical Market Prices
CREATE TABLE IF NOT EXISTS market_prices (
  id TEXT PRIMARY KEY,
  raw_record_id TEXT REFERENCES market_prices_raw(id) ON DELETE SET NULL,
  market_id TEXT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  commodity_id TEXT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  variety_id TEXT REFERENCES commodity_varieties(id) ON DELETE SET NULL,
  grade_id TEXT REFERENCES commodity_grades(id) ON DELETE SET NULL,
  arrival_date DATE NOT NULL,
  minimum_price NUMERIC(12, 2) NOT NULL,
  maximum_price NUMERIC(12, 2) NOT NULL,
  modal_price NUMERIC(12, 2) NOT NULL,
  arrival_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  unit TEXT NOT NULL DEFAULT 'Quintal',
  source TEXT NOT NULL DEFAULT 'Directorate of Marketing & Inspection, Agmarknet',
  source_record_id TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_price_validity CHECK (minimum_price >= 0 AND maximum_price >= minimum_price AND modal_price >= minimum_price AND modal_price <= maximum_price),
  CONSTRAINT uq_market_price_observation UNIQUE(market_id, commodity_id, variety_id, arrival_date)
);

-- 9. Market Price Forecasts
CREATE TABLE IF NOT EXISTS market_price_forecasts (
  id TEXT PRIMARY KEY,
  market_id TEXT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  commodity_id TEXT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  variety_id TEXT REFERENCES commodity_varieties(id) ON DELETE SET NULL,
  forecast_date DATE NOT NULL,
  horizon_days INTEGER NOT NULL, -- 7, 15, 30, 60, 90
  model_name TEXT NOT NULL, -- 'ARIMA_AUTOREG', 'SEASONAL_NAIVE', 'RIDGE_TREND'
  model_version TEXT NOT NULL DEFAULT 'v1.0',
  predicted_modal_price NUMERIC(12, 2) NOT NULL,
  lower_bound NUMERIC(12, 2) NOT NULL,
  upper_bound NUMERIC(12, 2) NOT NULL,
  direction TEXT NOT NULL, -- 'UPWARD', 'DOWNWARD', 'STABLE'
  confidence TEXT NOT NULL DEFAULT 'MEDIUM', -- 'HIGH', 'MEDIUM', 'LOW'
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb, -- {'mae': ..., 'rmse': ..., 'mape': ..., 'directional_accuracy': ...}
  generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_forecast_record UNIQUE(market_id, commodity_id, variety_id, forecast_date, horizon_days, model_version)
);

-- 10. Market Ingestion & Synchronization Logs
CREATE TABLE IF NOT EXISTS market_sync_logs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  records_received INTEGER NOT NULL DEFAULT 0,
  records_valid INTEGER NOT NULL DEFAULT 0,
  records_rejected INTEGER NOT NULL DEFAULT 0,
  records_duplicate INTEGER NOT NULL DEFAULT 0,
  execution_time_ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'PARTIAL', 'FAILED'
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_market_prices_commodity_market_date 
  ON market_prices(commodity_id, market_id, arrival_date DESC);

CREATE INDEX IF NOT EXISTS idx_market_prices_market_date 
  ON market_prices(market_id, arrival_date DESC);

CREATE INDEX IF NOT EXISTS idx_market_prices_arrival_date 
  ON market_prices(arrival_date DESC);

CREATE INDEX IF NOT EXISTS idx_market_prices_commodity_date 
  ON market_prices(commodity_id, arrival_date DESC);

CREATE INDEX IF NOT EXISTS idx_market_forecasts_lookup 
  ON market_price_forecasts(commodity_id, market_id, horizon_days, forecast_date DESC);

CREATE INDEX IF NOT EXISTS idx_markets_state_district 
  ON markets(state, district);

CREATE INDEX IF NOT EXISTS idx_varieties_commodity 
  ON commodity_varieties(commodity_id);

CREATE INDEX IF NOT EXISTS idx_market_prices_raw_batch 
  ON market_prices_raw(batch_id, status);

-- 12. Seed Master Data (Commodities, Varieties, Grades, Units, Mandis)

-- Measurement Units
INSERT INTO measurement_units (id, name, code, to_base_multiplier, base_unit) VALUES
('unit-quintal', 'Quintal (100 kg)', 'QTL', 1.0000, 'Quintal'),
('unit-kg', 'Kilogram', 'KG', 0.0100, 'Quintal'),
('unit-tonne', 'Metric Tonne (1,000 kg)', 'MT', 10.0000, 'Quintal'),
('unit-bag-50kg', 'Gunny Bag (50 kg)', 'BAG_50', 0.5000, 'Quintal'),
('unit-crate-25kg', 'Produce Crate (25 kg)', 'CRATE_25', 0.2500, 'Quintal')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  to_base_multiplier = EXCLUDED.to_base_multiplier;

-- Grades
INSERT INTO commodity_grades (id, name, code, description) VALUES
('grade-faq', 'Fair Average Quality (FAQ)', 'FAQ', 'Standard commercial mandi acceptable quality'),
('grade-a', 'Grade A / Special Selection', 'GRADE_A', 'Superior bold size, uniform moisture, zero damage'),
('grade-b', 'Grade B / Medium', 'GRADE_B', 'Standard acceptable quality with minor size variance'),
('grade-premium', 'Premium / Bold Size', 'PREMIUM', 'Top 5 percentile produce lot with premium sheen'),
('grade-export', 'Export Quality (APEDA/GlobalGAP)', 'EXPORT', 'Certified export lot adhering to pesticide MRLs')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Commodities
INSERT INTO commodities (id, name, code, local_names, category, default_unit, description) VALUES
('comm-mirchi', 'Mirchi (Chilli)', 'MIRCHI', '{"hi": "लाल मिर्च", "te": "మిర్చి", "kn": "ಕೆಂಪು ಮೆಣಸಿನಕಾಯಿ", "mr": "लाल मिरची", "ta": "சிவப்பு மிளகாய்"}'::jsonb, 'spices', 'Quintal', 'Commercial dry red chilli for domestic processing and export'),
('comm-rice', 'Rice (Paddy)', 'RICE', '{"hi": "चावल / धान", "te": "వరి / ధాన్యం", "kn": "ಭತ್ತ / ಅಕ್ಕಿ", "mr": "तांदूळ / भात", "ta": "அரிசி / நெல்"}'::jsonb, 'cereals', 'Quintal', 'Staple grain paddy for direct millers and state civil supplies procurement'),
('comm-redgram', 'Red Gram (Tur / Arhar)', 'RED_GRAM', '{"hi": "अरहर / तूर दाल", "te": "కందులు", "kn": "ತೊಗರಿ ಬೇಳೆ", "mr": "तूर", "ta": "துவரம் பருப்பு"}'::jsonb, 'pulses', 'Quintal', 'Key protein pulse widely traded in Central and South Indian APMC mandis'),
('comm-cotton', 'Cotton (Kapas)', 'COTTON', '{"hi": "कपास", "te": "పత్తి", "kn": "ಹತ್ತಿ", "mr": "कापूस", "ta": "பருத்தி"}'::jsonb, 'cash_crops', 'Quintal', 'Long staple and medium staple raw cotton for ginning mills'),
('comm-onion', 'Onion', 'ONION', '{"hi": "प्याज", "te": "ఉల్లిపాయలు", "kn": "ಈರುಳ್ಳಿ", "mr": "कांदा", "ta": "வெங்காயம்"}'::jsonb, 'vegetables', 'Quintal', 'Perishable vegetable staple primarily traded in Nashik and Pune belts'),
('comm-tomato', 'Tomato', 'TOMATO', '{"hi": "टमाटर", "te": "టమోటా", "kn": "ಟೊಮೆಟೊ", "mr": "टोमॅटो", "ta": "தக்காளி"}'::jsonb, 'vegetables', 'Quintal', 'Fresh horticultural produce prone to high seasonal volatility'),
('comm-wheat', 'Wheat', 'WHEAT', '{"hi": "गेहूं", "te": "గోధుమలు", "kn": "ಗೋಧಿ", "mr": "गहू", "ta": "கோதுமை"}'::jsonb, 'cereals', 'Quintal', 'Rabi crop grain with MSP benchmark traded extensively across Central and North India'),
('comm-maize', 'Maize (Corn)', 'MAIZE', '{"hi": "मक्का", "te": "మొక్కజొన్న", "kn": "ಮೆಕ್ಕೆಜೋಳ", "mr": "मका", "ta": "மக்காச்சோளம்"}'::jsonb, 'cereals', 'Quintal', 'Industrial, starch, and poultry feed staple crop'),
('comm-groundnut', 'Groundnut (Peanut)', 'GROUNDNUT', '{"hi": "मूंगफली", "te": "వేరుశనగ", "kn": "ಕಡಲೆಕಾಯಿ", "mr": "भुईमूग", "ta": "வேர்க்கடலை"}'::jsonb, 'oilseeds', 'Quintal', 'Major edible oilseed and direct confectionery commodity')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  local_names = EXCLUDED.local_names,
  category = EXCLUDED.category,
  description = EXCLUDED.description;

-- Varieties
INSERT INTO commodity_varieties (id, commodity_id, name, code, aliases) VALUES
-- Mirchi Varieties
('var-mirchi-teja', 'comm-mirchi', 'Guntur Teja (S-17)', 'TEJA', '["Teja", "S-17", "Teja Stemless", "Guntur Mirchi"]'::jsonb),
('var-mirchi-byadgi', 'comm-mirchi', 'Byadgi Dabbi / Kaddi', 'BYADGI', '["Byadagi", "Dabbi", "Kaddi", "Karnataka Mirchi"]'::jsonb),
('var-mirchi-334', 'comm-mirchi', 'S-334 / S4 Sanam', 'S334', '["334", "S-4", "Sanam", "Medium Pungent"]'::jsonb),
('var-mirchi-wonder', 'comm-mirchi', 'Wonder Hot / 273', 'WONDER', '["273", "Wonder Hot", "Peshawari Red"]'::jsonb),

-- Rice / Paddy Varieties
('var-rice-sona', 'comm-rice', 'Sona Masuri (BPT 5204)', 'SONA_MASURI', '["Sona Masoori", "BPT 5204", "Samba Mahsuri", "Andhra Rice"]'::jsonb),
('var-rice-basmati', 'comm-rice', 'Traditional Basmati 1121', 'BASMATI_1121', '["Basmati 1121", "Pusa 1121", "Export Basmati"]'::jsonb),
('var-rice-ir64', 'comm-rice', 'IR-64 Raw / Parboiled', 'IR64', '["IR-64", "IR64", "Common Paddy"]'::jsonb),

-- Red Gram Varieties
('var-redgram-maruti', 'comm-redgram', 'Maruti (ICP 8863)', 'MARUTI', '["Maruti", "ICP 8863", "Gulbarga Red Gram", "Desi Tur"]'::jsonb),
('var-redgram-asha', 'comm-redgram', 'Asha (ICPL 87119)', 'ASHA', '["Asha", "ICPL 87119", "White Tur"]'::jsonb),

-- Cotton Varieties
('var-cotton-bt', 'comm-cotton', 'Bt Cotton (Bollgard II)', 'BT2', '["Bt Cotton", "BG-II", "Long Staple Kapas"]'::jsonb),
('var-cotton-dch', 'comm-cotton', 'DCH-32 Extra Long Staple', 'DCH32', '["DCH-32", "Suvin Cotton"]'::jsonb),

-- Onion Varieties
('var-onion-garwa', 'comm-onion', 'Nashik Red Garwa (Summer)', 'GARWA', '["Garwa", "Nashik Kanda", "Dark Red Onion"]'::jsonb),
('var-onion-pol', 'comm-onion', 'Pol / Kharif Early Red', 'POL', '["Pol Onion", "Kharif Kanda", "Early Red"]'::jsonb),

-- Wheat Varieties
('var-wheat-sharbati', 'comm-wheat', 'MP Sharbati (C-306)', 'SHARBATI', '["Sharbati", "C-306", "Sehore Gold"]'::jsonb),
('var-wheat-lokwan', 'comm-wheat', 'Lokwan (Standard Mill Quality)', 'LOKWAN', '["Lokwan", "Mill Quality Wheat"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  aliases = EXCLUDED.aliases;

-- Mandis / Markets across major agricultural states in India
INSERT INTO markets (id, market_name, mandi_code, state, district, city, latitude, longitude, market_type, data_source) VALUES
-- Andhra Pradesh & Telangana (Mirchi / Rice / Cotton hubs)
('mkt-guntur', 'Guntur APMC Yard', 'AP_GNT_01', 'Andhra Pradesh', 'Guntur', 'Guntur', 16.3067, 80.4365, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),
('mkt-warangal', 'Warangal Enamamula Market Yard', 'TG_WRG_01', 'Telangana', 'Warangal', 'Warangal', 17.9689, 79.5941, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),
('mkt-khammam', 'Khammam Agricultural Market', 'TG_KHM_01', 'Telangana', 'Khammam', 'Khammam', 17.2473, 80.1514, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),
('mkt-nizamabad', 'Nizamabad APMC Yard', 'TG_NZB_01', 'Telangana', 'Nizamabad', 'Nizamabad', 18.6725, 78.0941, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),

-- Karnataka (Byadgi Chilli, Red Gram, Rice)
('mkt-byadgi', 'Byadgi APMC Yard', 'KA_HAV_01', 'Karnataka', 'Haveri', 'Byadgi', 14.6800, 75.4900, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),
('mkt-kalaburagi', 'Kalaburagi (Gulbarga) APMC Mandi', 'KA_GLB_01', 'Karnataka', 'Kalaburagi', 'Kalaburagi', 17.3297, 76.8343, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),
('mkt-raichur', 'Raichur Cotton & Grain Market', 'KA_RAI_01', 'Karnataka', 'Raichur', 'Raichur', 16.2120, 77.3439, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),

-- Maharashtra (Onion, Cotton, Pulses, Grains)
('mkt-lasalgaon', 'Lasalgaon APMC (Asia Largest Onion Market)', 'MH_NSK_01', 'Maharashtra', 'Nashik', 'Lasalgaon', 20.1450, 74.2250, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),
('mkt-pune', 'Pune Gultekdi Market Yard', 'MH_PUN_01', 'Maharashtra', 'Pune', 'Pune', 18.4967, 73.8631, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),
('mkt-latur', 'Latur APMC (Premier Pulse Exchange)', 'MH_LTR_01', 'Maharashtra', 'Latur', 'Latur', 18.4088, 76.5604, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),
('mkt-akola', 'Akola Cotton & Grain Mandi', 'MH_AKL_01', 'Maharashtra', 'Akola', 'Akola', 20.7002, 77.0082, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),
('mkt-solapur', 'Solapur APMC Market', 'MH_SLP_01', 'Maharashtra', 'Solapur', 'Solapur', 17.6599, 75.9064, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),

-- Madhya Pradesh (Wheat, Soybean, Gram)
('mkt-sehore', 'Sehore Mandi (Sharbati Gold)', 'MP_SEH_01', 'Madhya Pradesh', 'Sehore', 'Sehore', 23.2031, 77.0844, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),
('mkt-indore', 'Indore Laxmibai Nagar Mandi', 'MP_IND_01', 'Madhya Pradesh', 'Indore', 'Indore', 22.7533, 75.8937, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),

-- Punjab & Haryana (Basmati & Paddy)
('mkt-karnal', 'Karnal Grain Market', 'HR_KAR_01', 'Haryana', 'Karnal', 'Karnal', 29.6857, 76.9905, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet'),
('mkt-khanna', 'Khanna Grain Market (Asia Premier Wheat/Paddy)', 'PB_LDH_01', 'Punjab', 'Ludhiana', 'Khanna', 30.7020, 76.2160, 'APMC_PRINCIPAL', 'Directorate of Marketing & Inspection, Agmarknet')
ON CONFLICT (id) DO UPDATE SET
  market_name = EXCLUDED.market_name,
  state = EXCLUDED.state,
  district = EXCLUDED.district,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;
