-- ==============================================================================
-- Migration 003: Business Integrity CHECK Constraints
-- Database: Supabase PostgreSQL
-- ==============================================================================

-- Users Constraints
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS chk_users_kisan_coins,
  ADD CONSTRAINT chk_users_kisan_coins CHECK (kisan_coins >= 0);

-- Coupons Constraints
ALTER TABLE coupons
  DROP CONSTRAINT IF EXISTS chk_coupons_discount_percent,
  DROP CONSTRAINT IF EXISTS chk_coupons_max_discount,
  DROP CONSTRAINT IF EXISTS chk_coupons_min_order_amount,
  ADD CONSTRAINT chk_coupons_discount_percent CHECK (discount_percent > 0 AND discount_percent <= 100),
  ADD CONSTRAINT chk_coupons_max_discount CHECK (max_discount >= 0),
  ADD CONSTRAINT chk_coupons_min_order_amount CHECK (min_order_amount >= 0);

-- Products Constraints
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS chk_products_price,
  DROP CONSTRAINT IF EXISTS chk_products_original_price,
  DROP CONSTRAINT IF EXISTS chk_products_rating,
  DROP CONSTRAINT IF EXISTS chk_products_review_count,
  DROP CONSTRAINT IF EXISTS chk_products_stock_count,
  ADD CONSTRAINT chk_products_price CHECK (price >= 0),
  ADD CONSTRAINT chk_products_original_price CHECK (original_price >= price),
  ADD CONSTRAINT chk_products_rating CHECK (rating >= 1.0 AND rating <= 5.0),
  ADD CONSTRAINT chk_products_review_count CHECK (review_count >= 0),
  ADD CONSTRAINT chk_products_stock_count CHECK (stock_count >= 0);

-- Market Listings Constraints
ALTER TABLE market_listings
  DROP CONSTRAINT IF EXISTS chk_market_listings_quantity,
  DROP CONSTRAINT IF EXISTS chk_market_listings_min_order,
  DROP CONSTRAINT IF EXISTS chk_market_listings_price_per_unit,
  DROP CONSTRAINT IF EXISTS chk_market_listings_status,
  ADD CONSTRAINT chk_market_listings_quantity CHECK (quantity > 0),
  ADD CONSTRAINT chk_market_listings_min_order CHECK (min_order_quantity > 0),
  ADD CONSTRAINT chk_market_listings_price_per_unit CHECK (price_per_unit > 0),
  ADD CONSTRAINT chk_market_listings_status CHECK (status IN ('ACTIVE', 'CLOSED', 'SOLD', 'PAUSED'));

-- Market Inquiries Constraints
ALTER TABLE market_inquiries
  DROP CONSTRAINT IF EXISTS chk_market_inquiries_offered_price,
  DROP CONSTRAINT IF EXISTS chk_market_inquiries_requested_quantity,
  DROP CONSTRAINT IF EXISTS chk_market_inquiries_status,
  ADD CONSTRAINT chk_market_inquiries_offered_price CHECK (offered_price_per_unit > 0),
  ADD CONSTRAINT chk_market_inquiries_requested_quantity CHECK (requested_quantity > 0),
  ADD CONSTRAINT chk_market_inquiries_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'NEGOTIATING'));

-- Orders Constraints
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS chk_orders_subtotal,
  DROP CONSTRAINT IF EXISTS chk_orders_delivery_fee,
  DROP CONSTRAINT IF EXISTS chk_orders_discount,
  DROP CONSTRAINT IF EXISTS chk_orders_gst,
  DROP CONSTRAINT IF EXISTS chk_orders_coins_used,
  DROP CONSTRAINT IF EXISTS chk_orders_coins_earned,
  DROP CONSTRAINT IF EXISTS chk_orders_final_total,
  DROP CONSTRAINT IF EXISTS chk_orders_status,
  ADD CONSTRAINT chk_orders_subtotal CHECK (subtotal >= 0),
  ADD CONSTRAINT chk_orders_delivery_fee CHECK (delivery_fee >= 0),
  ADD CONSTRAINT chk_orders_discount CHECK (discount >= 0),
  ADD CONSTRAINT chk_orders_gst CHECK (gst >= 0),
  ADD CONSTRAINT chk_orders_coins_used CHECK (coins_used >= 0),
  ADD CONSTRAINT chk_orders_coins_earned CHECK (coins_earned >= 0),
  ADD CONSTRAINT chk_orders_final_total CHECK (final_total >= 0),
  ADD CONSTRAINT chk_orders_status CHECK (status IN ('CONFIRMED', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'));

-- Order Items Constraints
ALTER TABLE order_items
  DROP CONSTRAINT IF EXISTS chk_order_items_quantity,
  DROP CONSTRAINT IF EXISTS chk_order_items_unit_price,
  DROP CONSTRAINT IF EXISTS chk_order_items_total_price,
  ADD CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  ADD CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0),
  ADD CONSTRAINT chk_order_items_total_price CHECK (total_price >= 0);

-- Reviews Constraints
ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS chk_reviews_rating,
  ADD CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5);
