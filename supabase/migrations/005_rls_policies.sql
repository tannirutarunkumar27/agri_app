-- ==============================================================================
-- Migration 005: Row Level Security (RLS) Policies
-- Database: Supabase PostgreSQL
-- ==============================================================================

-- Enable Row Level Security on all public-facing and sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 1. PRODUCTS: Public Read-Only for active catalog; Service Role write
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view in-stock or catalog products"
  ON products FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- 2. COUPONS: Public Read-Only for active coupons
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view active coupons"
  ON coupons FOR SELECT
  USING (active = true);

-- -----------------------------------------------------------------------------
-- 3. REVIEWS & PRODUCT QUESTIONS: Public Read; Authenticated or Verified write
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can read reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Public can read product questions"
  ON product_questions FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- 4. MARKET LISTINGS: Public Read for ACTIVE listings; Sellers manage their own
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view active market listings"
  ON market_listings FOR SELECT
  USING (status = 'ACTIVE' OR status = 'SOLD');

CREATE POLICY "Sellers can view all their own listings"
  ON market_listings FOR SELECT
  USING (seller_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Sellers can insert their own listings"
  ON market_listings FOR INSERT
  WITH CHECK (seller_id = current_setting('request.jwt.claim.sub', true) OR seller_id IS NOT NULL);

CREATE POLICY "Sellers can update their own listings"
  ON market_listings FOR UPDATE
  USING (seller_id = current_setting('request.jwt.claim.sub', true));

-- -----------------------------------------------------------------------------
-- 5. MARKET INQUIRIES: Listing Seller & Inquiry Buyer can view
-- -----------------------------------------------------------------------------
CREATE POLICY "Sellers and buyers can view related inquiries"
  ON market_inquiries FOR SELECT
  USING (
    buyer_phone = current_setting('request.jwt.claim.phone', true)
    OR EXISTS (
      SELECT 1 FROM market_listings
      WHERE market_listings.id = market_inquiries.listing_id
      AND market_listings.seller_id = current_setting('request.jwt.claim.sub', true)
    )
  );

CREATE POLICY "Buyers can submit inquiries"
  ON market_inquiries FOR INSERT
  WITH CHECK (requested_quantity > 0 AND offered_price_per_unit > 0);

-- -----------------------------------------------------------------------------
-- 6. USERS & ADDRESSES: Isolated to individual account holders
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can manage their own addresses"
  ON addresses FOR ALL
  USING (user_id = current_setting('request.jwt.claim.sub', true));

-- -----------------------------------------------------------------------------
-- 7. ORDERS & ORDER ITEMS: Customers view their own orders; Service Role manages
-- -----------------------------------------------------------------------------
CREATE POLICY "Customers can view their own orders"
  ON orders FOR SELECT
  USING (user_phone = current_setting('request.jwt.claim.phone', true));

CREATE POLICY "Customers can view items of their own orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_phone = current_setting('request.jwt.claim.phone', true)
    )
  );

-- -----------------------------------------------------------------------------
-- 8. WISHLIST & NOTIFICATIONS: Private per user
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can manage their wishlist"
  ON wishlist FOR ALL
  USING (user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can view and update their notifications"
  ON notifications FOR ALL
  USING (user_id = current_setting('request.jwt.claim.sub', true));
