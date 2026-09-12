-- ==============================================================================
-- Migration 002: B-Tree Indexes for Performance Optimization
-- Database: Supabase PostgreSQL
-- ==============================================================================

-- Products Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_count);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);

-- Orders Indexes
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(user_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order Items & Status Log Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_status_log_order_id ON order_status_log(order_id);

-- Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(product_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Product Questions Index
CREATE INDEX IF NOT EXISTS idx_questions_product_id ON product_questions(product_id);

-- Wishlist Index
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);

-- Users & Addresses Indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Market Listings Indexes
CREATE INDEX IF NOT EXISTS idx_market_listings_category ON market_listings(category);
CREATE INDEX IF NOT EXISTS idx_market_listings_crop ON market_listings(crop_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_status ON market_listings(status);
CREATE INDEX IF NOT EXISTS idx_market_listings_seller ON market_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_district ON market_listings(seller_district);
CREATE INDEX IF NOT EXISTS idx_market_listings_created ON market_listings(created_at DESC);

-- Market Inquiries Indexes
CREATE INDEX IF NOT EXISTS idx_market_inquiries_listing ON market_inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_market_inquiries_created ON market_inquiries(created_at DESC);
