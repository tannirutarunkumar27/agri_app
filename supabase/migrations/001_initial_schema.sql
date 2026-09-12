-- ==============================================================================
-- Migration 001: Initial Schema for FarmOS / FarmDirect
-- Database: Supabase PostgreSQL
-- ==============================================================================

-- 1. Users table (Farmers, Retailers, Admin)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  district TEXT DEFAULT 'Pune',
  state TEXT DEFAULT 'Maharashtra',
  farm_size_acres NUMERIC(6, 2) DEFAULT 2.50,
  primary_crop TEXT DEFAULT 'Sugarcane & Vegetables',
  kisan_coins INTEGER DEFAULT 250,
  role TEXT DEFAULT 'farmer',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Delivery / Farm Gate Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_type TEXT NOT NULL DEFAULT 'Farm Gate / Land',
  street TEXT NOT NULL,
  village TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  instructions TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Discount Coupons
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  discount_percent INTEGER NOT NULL,
  max_discount NUMERIC(10, 2) NOT NULL,
  min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  description TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Catalog (Fertilizers, Seeds, Crop Protection, Bio-inputs)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  crop TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  badge TEXT,
  tone TEXT,
  rating NUMERIC(3, 1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  stock_count INTEGER NOT NULL DEFAULT 0,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  delivery_days TEXT NOT NULL,
  seller TEXT NOT NULL,
  composition TEXT NOT NULL,
  npk_ratio TEXT,
  dosage_per_acre TEXT NOT NULL,
  application_method TEXT NOT NULL,
  description TEXT NOT NULL,
  safety_advice TEXT NOT NULL,
  features_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  suitable_crops_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Produce Market Listings (Farmer Produce for direct sale)
CREATE TABLE IF NOT EXISTS market_listings (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_village TEXT NOT NULL,
  seller_district TEXT NOT NULL,
  seller_state TEXT NOT NULL,
  category TEXT NOT NULL,
  crop_id TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  variety TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  min_order_quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
  price_per_unit NUMERIC(10, 2) NOT NULL,
  mandi_benchmark_price NUMERIC(10, 2),
  msp_price NUMERIC(10, 2),
  is_negotiable BOOLEAN NOT NULL DEFAULT true,
  quality_grade TEXT NOT NULL,
  moisture_percent NUMERIC(5, 2),
  harvest_date DATE NOT NULL,
  is_organic BOOLEAN NOT NULL DEFAULT false,
  packaging_type TEXT NOT NULL,
  logistics_mode TEXT NOT NULL,
  farm_gate_address TEXT NOT NULL,
  description TEXT NOT NULL,
  images_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  views_count INTEGER NOT NULL DEFAULT 0,
  inquiries_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Produce Market Inquiries (Buyer counter-offers to farmers)
CREATE TABLE IF NOT EXISTS market_inquiries (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES market_listings(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_type TEXT NOT NULL,
  buyer_location TEXT NOT NULL,
  offered_price_per_unit NUMERIC(10, 2) NOT NULL,
  requested_quantity NUMERIC(10, 2) NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  address_json JSONB NOT NULL,
  delivery_speed TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  gst NUMERIC(10, 2) NOT NULL,
  coins_used INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  final_total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL
);

-- 9. Order Status Audit Log
CREATE TABLE IF NOT EXISTS order_status_log (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Farmer Product Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  location TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  crop_grown TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Product Q&A
CREATE TABLE IF NOT EXISTS product_questions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  asked_by TEXT NOT NULL,
  answer TEXT,
  answered_by TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_wishlist_user_product UNIQUE(user_id, product_id)
);

-- 13. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'order',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
