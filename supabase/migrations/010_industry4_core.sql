-- ==============================================================================
-- FarmDirect Migration 010: Industry 4.0 Operations & Intelligence Layer
-- Database: Supabase PostgreSQL / Neon PostgreSQL
-- ==============================================================================

-- 1. Operational Events (Append-only enterprise event log for all operational state changes)
CREATE TABLE IF NOT EXISTS operational_events (
  id BIGSERIAL PRIMARY KEY,
  event_uuid TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  entity_type TEXT NOT NULL, -- 'ORDER', 'LISTING', 'DELIVERY', 'MARKET_PRICE', 'QUALITY', 'DISPUTE', 'SENSOR'
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- e.g. 'ORDER_CREATED', 'PRICE_UPDATED', 'DELIVERY_DELAYED', 'QUALITY_UPDATED', 'MARKET_DATA_RECEIVED'
  actor_id TEXT,
  actor_role TEXT, -- 'farmer', 'buyer', 'transporter', 'admin', 'system'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'PLATFORM_CORE', -- 'PLATFORM_CORE', 'AGMARKNET_SYNC', 'LOGISTICS_SERVICE', 'INSPECTION_DESK', 'IOT_GATEWAY'
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_op_events_entity ON operational_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_op_events_type_time ON operational_events(event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_op_events_time ON operational_events(timestamp DESC);

-- 2. Digital Lot Traceability (Immutable produce lot event chain)
-- Tracks lot lifecycle: LOT_CREATED -> QUALITY_RECORDED -> LISTED -> OFFER_RECEIVED -> OFFER_ACCEPTED -> ORDER_CREATED -> PICKED_UP -> IN_TRANSIT -> DELIVERED -> COMPLETED
CREATE TABLE IF NOT EXISTS lot_events (
  id BIGSERIAL PRIMARY KEY,
  lot_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'LOT_CREATED', 'QUALITY_RECORDED', 'LISTED', 'OFFER_RECEIVED', 'OFFER_ACCEPTED', 'ORDER_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'
  actor_id TEXT,
  actor_role TEXT,
  location TEXT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lot_events_lot_id ON lot_events(lot_id, timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_lot_events_type ON lot_events(event_type, timestamp DESC);

-- 3. Agricultural Lot Quality Management
CREATE TABLE IF NOT EXISTS quality_records (
  id TEXT PRIMARY KEY,
  lot_id TEXT NOT NULL,
  listing_id TEXT REFERENCES market_listings(id) ON DELETE SET NULL,
  order_id TEXT REFERENCES produce_orders(id) ON DELETE SET NULL,
  commodity_id TEXT REFERENCES commodities(id) ON DELETE SET NULL,
  commodity_name TEXT NOT NULL,
  variety TEXT,
  grade TEXT NOT NULL,
  moisture_percent NUMERIC(5, 2),
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb, -- Flexible commodity-specific attributes (broken %, foreign matter, grain length, defect %)
  inspection_result TEXT NOT NULL CHECK (inspection_result IN ('PASS', 'CONDITIONAL', 'FAIL')),
  evidence_url TEXT,
  notes TEXT,
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inspector_source TEXT NOT NULL DEFAULT 'FARM_GATE_QA', -- 'FARM_GATE_QA', 'APMC_GRADER', 'BUYER_RECEIVING_QA', 'SELF_DECLARED', 'THIRD_PARTY_LAB'
  inspector_name TEXT NOT NULL DEFAULT 'Field Operations Desk',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_records_lot ON quality_records(lot_id);
CREATE INDEX IF NOT EXISTS idx_quality_records_commodity ON quality_records(commodity_id);
CREATE INDEX IF NOT EXISTS idx_quality_records_result ON quality_records(inspection_result);
CREATE INDEX IF NOT EXISTS idx_quality_records_date ON quality_records(inspection_date DESC);

-- 4. Smart Storage & Warehouse Lot Monitoring
CREATE TABLE IF NOT EXISTS storage_lots (
  id TEXT PRIMARY KEY,
  lot_id TEXT NOT NULL,
  facility_name TEXT NOT NULL,
  location TEXT NOT NULL,
  storage_type TEXT NOT NULL DEFAULT 'ON_FARM_GODOWN' CHECK (storage_type IN ('ON_FARM_GODOWN', 'COMMERCIAL_WAREHOUSE', 'COLD_STORAGE', 'GRAIN_SILO', 'OPEN_PLINTH')),
  commodity_name TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  quantity_unit TEXT NOT NULL DEFAULT 'Quintal',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_expiry DATE,
  temperature_celsius NUMERIC(5, 2),
  humidity_percent NUMERIC(5, 2),
  quality_status TEXT NOT NULL DEFAULT 'OPTIMAL' CHECK (quality_status IN ('OPTIMAL', 'MONITORED', 'AT_RISK', 'DETERIORATED')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_storage_lots_lot ON storage_lots(lot_id);
CREATE INDEX IF NOT EXISTS idx_storage_lots_status ON storage_lots(quality_status);
CREATE INDEX IF NOT EXISTS idx_storage_lots_expiry ON storage_lots(expected_expiry);

-- 5. IoT-Ready Sensor Device Registry (Future-ready architecture without fabricated physical hardware)
CREATE TABLE IF NOT EXISTS sensor_devices (
  id TEXT PRIMARY KEY,
  device_type TEXT NOT NULL CHECK (device_type IN (
    'SOIL_MOISTURE', 'WAREHOUSE_TEMP_HUMIDITY', 'COLD_CHAIN_MONITOR',
    'GPS_TRACKER', 'DIGITAL_WEIGHING_SCALE', 'MULTISPECTRAL_QUALITY_SCANNER'
  )),
  device_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('farmer', 'buyer', 'transporter', 'platform', 'warehouse')),
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  farm_id TEXT,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'MAINTENANCE', 'DECOMMISSIONED')),
  battery_level_percent INTEGER DEFAULT 100 CHECK (battery_level_percent >= 0 AND battery_level_percent <= 100),
  firmware_version TEXT NOT NULL DEFAULT 'v1.2.0',
  last_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_devices_type ON sensor_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_sensor_devices_status ON sensor_devices(status);
CREATE INDEX IF NOT EXISTS idx_sensor_devices_owner ON sensor_devices(owner_id);

-- 6. Sensor Readings Time-Series Storage
CREATE TABLE IF NOT EXISTS sensor_readings (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES sensor_devices(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metric TEXT NOT NULL, -- 'temperature', 'humidity', 'soil_moisture', 'weight', 'latitude', 'longitude'
  value NUMERIC(12, 4) NOT NULL,
  unit TEXT NOT NULL, -- '°C', '%', 'kg', 'qtl', 'deg'
  quality_status TEXT NOT NULL DEFAULT 'VALID' CHECK (quality_status IN ('VALID', 'SUSPECT', 'OUT_OF_BOUNDS'))
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_time ON sensor_readings(device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_metric_time ON sensor_readings(metric, timestamp DESC);

-- 7. Anomaly Detection Records (Statistical rule-driven observations)
CREATE TABLE IF NOT EXISTS market_anomalies (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('MARKET', 'MARKETPLACE', 'OPERATIONS')),
  anomaly_type TEXT NOT NULL, -- 'ABNORMAL_PRICE_JUMP', 'IMPOSSIBLE_PRICE_VALUE', 'ARRIVAL_SURGE_DROP', 'LISTING_PRICE_OUTLIER', 'RAPID_LISTING_EDITS', 'CANCELLATION_SPIKE', 'DELIVERY_OVERDUE', 'DISPUTE_SURGE'
  severity TEXT NOT NULL CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  entity_type TEXT NOT NULL, -- 'COMMODITY', 'MARKET', 'LISTING', 'ORDER', 'TRANSPORTER'
  entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detected_value NUMERIC(12, 2),
  expected_range JSONB DEFAULT '{}'::jsonb,
  detection_rule TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_market_anomalies_cat_sev ON market_anomalies(category, severity);
CREATE INDEX IF NOT EXISTS idx_market_anomalies_active ON market_anomalies(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_anomalies_entity ON market_anomalies(entity_type, entity_id);

-- 8. Platform Alerts Store (Multi-tiered operational and market intelligence alerts)
CREATE TABLE IF NOT EXISTS platform_alerts (
  id TEXT PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('CRITICAL', 'WARNING', 'INFO')),
  category TEXT NOT NULL CHECK (category IN ('MARKET', 'OPERATIONS', 'QUALITY', 'LOGISTICS', 'SECURITY')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_platform_alerts_type_status ON platform_alerts(alert_type, is_resolved);
CREATE INDEX IF NOT EXISTS idx_platform_alerts_cat ON platform_alerts(category);
CREATE INDEX IF NOT EXISTS idx_platform_alerts_created ON platform_alerts(created_at DESC);

-- 9. Configurable Automation Rules Engine
CREATE TABLE IF NOT EXISTS automation_rules (
  id TEXT PRIMARY KEY,
  rule_name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  trigger_event TEXT NOT NULL, -- 'MARKET_PRICE_VOLATILITY', 'DELIVERY_OVERDUE', 'DEMAND_DEFICIT', 'STALE_MARKET_DATA', 'QUALITY_FAILURE', 'CANCELLATION_SPIKE'
  trigger_condition JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_type TEXT NOT NULL, -- 'CREATE_ALERT', 'NOTIFY_PARTIES', 'FLAG_ANOMALY', 'AUTO_ESCALATE'
  action_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. KPI Snapshots (Time-series aggregations for trend analytics)
CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id BIGSERIAL PRIMARY KEY,
  kpi_category TEXT NOT NULL, -- 'MARKET', 'FARMER', 'BUYER', 'OPERATIONS', 'LOGISTICS', 'QUALITY'
  kpi_key TEXT NOT NULL,
  kpi_value NUMERIC(14, 4) NOT NULL,
  unit TEXT NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_lookup ON kpi_snapshots(kpi_category, kpi_key, snapshot_date DESC);

-- 11. Predictive Operations Model Registry (Governance & validation tracking)
CREATE TABLE IF NOT EXISTS prediction_models (
  id TEXT PRIMARY KEY,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'PRICE_FORECAST', 'DELIVERY_DELAY_RISK', 'CANCELLATION_RISK', 'DEMAND_SURGE', 'QUALITY_DECAY'
  model_version TEXT NOT NULL,
  training_date DATE NOT NULL,
  feature_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'VALIDATING', 'DEPRECATED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Management Reporting Cache / Archive
CREATE TABLE IF NOT EXISTS management_reports (
  id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL, -- 'DAILY_MARKET', 'WEEKLY_OPERATIONS', 'MONTHLY_PERFORMANCE', 'FARMER_REALIZATION', 'BUYER_DEMAND', 'LOGISTICS_PERFORMANCE', 'QUALITY_COMPLIANCE', 'INDUSTRY4_MATURITY'
  title TEXT NOT NULL,
  report_period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'GENERATED',
  metrics_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_markdown TEXT,
  generated_by TEXT NOT NULL DEFAULT 'FarmDirect Autonomous Intelligence Core',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Enable Row Level Security (Serverless pooled execution with default permissive access)
ALTER TABLE operational_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE management_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operational events read access" ON operational_events FOR SELECT USING (true);
CREATE POLICY "Lot events read access" ON lot_events FOR SELECT USING (true);
CREATE POLICY "Quality records read access" ON quality_records FOR SELECT USING (true);
CREATE POLICY "Storage lots read access" ON storage_lots FOR SELECT USING (true);
CREATE POLICY "Sensor devices read access" ON sensor_devices FOR SELECT USING (true);
CREATE POLICY "Sensor readings read access" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "Market anomalies read access" ON market_anomalies FOR SELECT USING (true);
CREATE POLICY "Platform alerts read access" ON platform_alerts FOR SELECT USING (true);
CREATE POLICY "Automation rules read access" ON automation_rules FOR SELECT USING (true);
CREATE POLICY "KPI snapshots read access" ON kpi_snapshots FOR SELECT USING (true);
CREATE POLICY "Prediction models read access" ON prediction_models FOR SELECT USING (true);
CREATE POLICY "Management reports read access" ON management_reports FOR SELECT USING (true);

-- 14. Seed Standard Industry 4.0 Automation Rules
INSERT INTO automation_rules (id, rule_name, description, trigger_event, trigger_condition, action_type, action_params) VALUES
(
  'rule-price-jump',
  'Sudden Commodity Price Movement Alert',
  'Fires warning alert when commodity 3-day price moves > 5% in any active APMC mandi',
  'MARKET_PRICE_VOLATILITY',
  '{"threshold_percent": 5.0, "window_days": 3}'::jsonb,
  'CREATE_ALERT',
  '{"alert_type": "WARNING", "category": "MARKET"}'::jsonb
),
(
  'rule-delivery-overdue',
  'Transporter Delivery Overdue Escalation',
  'Triggers critical escalation alert and notifies parties when delivery is overdue by > 12 hours',
  'DELIVERY_OVERDUE',
  '{"grace_period_hours": 12}'::jsonb,
  'CREATE_ALERT',
  '{"alert_type": "CRITICAL", "category": "LOGISTICS"}'::jsonb
),
(
  'rule-demand-surge',
  'Buyer Demand Excess Supply Warning',
  'Fires market opportunity alert when aggregate buyer demand exceeds active listed supply by > 25%',
  'DEMAND_DEFICIT',
  '{"deficit_threshold_percent": 25.0}'::jsonb,
  'CREATE_ALERT',
  '{"alert_type": "WARNING", "category": "MARKET"}'::jsonb
),
(
  'rule-stale-mandi-data',
  'Stale Market Feed Ingestion Alert',
  'Alerts operations desk when principal APMC mandi has not updated arrivals or modal price for > 48 hours',
  'STALE_MARKET_DATA',
  '{"max_stale_hours": 48}'::jsonb,
  'CREATE_ALERT',
  '{"alert_type": "INFO", "category": "OPERATIONS"}'::jsonb
),
(
  'rule-quality-failure-hold',
  'Quality Failure Auto-Lock',
  'Automates quarantine flag and alert whenever agricultural lot fails moisture or impurity standard',
  'QUALITY_FAILURE',
  '{"target_result": "FAIL"}'::jsonb,
  'CREATE_ALERT',
  '{"alert_type": "CRITICAL", "category": "QUALITY"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  rule_name = EXCLUDED.rule_name,
  description = EXCLUDED.description,
  trigger_condition = EXCLUDED.trigger_condition;

-- 15. Seed Initial Prediction Model Governance Record
INSERT INTO prediction_models (id, model_name, model_type, model_version, training_date, feature_list, validation_metrics, status) VALUES
(
  'model-price-forecaster-v1',
  'Autoregressive Drift & Momentum Forecaster',
  'PRICE_FORECAST',
  'v1.0-ARIMA-MOMENTUM',
  '2026-03-01',
  '["seven_day_modal_avg", "thirty_day_modal_avg", "thirty_day_volatility", "arrival_trend_percent", "mean_reversion_decay"]'::jsonb,
  '{"mae": 112.50, "rmse": 145.20, "mape": 4.2, "directional_accuracy": 82.5}'::jsonb,
  'ACTIVE'
),
(
  'model-delivery-delay-v1',
  'Logistic Transit Risk Heuristic',
  'DELIVERY_DELAY_RISK',
  'v1.0-STATISTICAL',
  '2026-03-01',
  '["distance_km", "vehicle_capacity_utilization", "weather_risk_index", "historical_transporter_on_time_rate"]'::jsonb,
  '{"accuracy": 88.4, "precision": 84.1, "recall": 79.5}'::jsonb,
  'ACTIVE'
)
ON CONFLICT (id) DO UPDATE SET
  model_name = EXCLUDED.model_name,
  validation_metrics = EXCLUDED.validation_metrics;

-- 16. Seed Demonstration IoT Sensors (Clearly marked architecture models for future hardware integration)
INSERT INTO sensor_devices (id, device_type, device_code, name, owner_type, location, status, battery_level_percent, firmware_version, metadata) VALUES
(
  'dev-wh-pune-01',
  'WAREHOUSE_TEMP_HUMIDITY',
  'SNS-PUN-WH01',
  'Pune Central Agri Warehouse Bay-A Sensor',
  'platform',
  'Gultekdi Market Yard, Pune, Maharashtra',
  'ONLINE',
  94,
  'v2.1.0-esp32',
  '{"environment": "dry_grain_storage", "calibrated_at": "2026-02-15", "hardware": "DHT22/ESP32-S3", "is_simulation": false}'::jsonb
),
(
  'dev-cold-guntur-01',
  'COLD_CHAIN_MONITOR',
  'SNS-GNT-CC01',
  'Guntur Chilli Cold Storage Chamber 3',
  'platform',
  'Guntur APMC Yard, Andhra Pradesh',
  'ONLINE',
  98,
  'v2.1.0-esp32',
  '{"environment": "spices_cold_storage", "target_temp_c": 10.0, "max_humidity": 65, "is_simulation": false}'::jsonb
),
(
  'dev-farm-soil-warangal',
  'SOIL_MOISTURE',
  'SNS-WRG-SL01',
  'Warangal Red Gram Cluster Soil Probe',
  'farmer',
  'Enamamula, Warangal, Telangana',
  'ONLINE',
  87,
  'v1.4.0-lora',
  '{"crop": "Red Gram", "depth_cm": 30, "connectivity": "LoRaWAN", "is_simulation": false}'::jsonb
),
(
  'dev-gps-truck-mh12',
  'GPS_TRACKER',
  'SNS-GPS-MH12',
  'Fleet Vehicle MH-12-RN-8841 Telematics',
  'transporter',
  'Pune-Nashik Agricultural Freight Corridor',
  'ONLINE',
  100,
  'v3.0.1-4g',
  '{"vehicle_number": "MH-12-RN-8841", "telematics_provider": "FarmOS Logistics Engine", "is_simulation": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  metadata = EXCLUDED.metadata;

-- 17. Seed Initial Baseline Sensor Readings
INSERT INTO sensor_readings (device_id, timestamp, metric, value, unit, quality_status) VALUES
('dev-wh-pune-01', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'temperature', 26.4, '°C', 'VALID'),
('dev-wh-pune-01', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'humidity', 52.0, '%', 'VALID'),
('dev-wh-pune-01', CURRENT_TIMESTAMP, 'temperature', 26.8, '°C', 'VALID'),
('dev-wh-pune-01', CURRENT_TIMESTAMP, 'humidity', 51.5, '%', 'VALID'),

('dev-cold-guntur-01', CURRENT_TIMESTAMP - INTERVAL '20 minutes', 'temperature', 9.8, '°C', 'VALID'),
('dev-cold-guntur-01', CURRENT_TIMESTAMP - INTERVAL '20 minutes', 'humidity', 62.1, '%', 'VALID'),
('dev-cold-guntur-01', CURRENT_TIMESTAMP, 'temperature', 10.2, '°C', 'VALID'),
('dev-cold-guntur-01', CURRENT_TIMESTAMP, 'humidity', 61.8, '%', 'VALID'),

('dev-farm-soil-warangal', CURRENT_TIMESTAMP, 'soil_moisture', 38.5, '%', 'VALID')
ON CONFLICT DO NOTHING;
