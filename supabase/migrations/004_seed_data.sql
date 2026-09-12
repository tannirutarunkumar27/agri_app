-- ==============================================================================
-- Migration 004: Seed Data for FarmOS / FarmDirect
-- Database: Supabase PostgreSQL
-- Idempotent seed data imported from development database
-- ==============================================================================

-- 1. Seed Users (1 rows)
INSERT INTO users (id, name, phone, email, password_hash, salt, district, state, farm_size_acres, primary_crop, kisan_coins, role, created_at)
VALUES ('farmer-demo', 'Ramesh Patil', '9822012345', 'ramesh.patil@farmos.agri', '98309ce7647d2eef89c4c95a0048c01529ac11f311499d5f2dde97c95fcf0103e05d30b7bb106da10a1b0ed11443b24950114294e109c34fee3965ad0c48493b', '3cf61865df90416669f9f47ba57e7335', 'Pune', 'Maharashtra', 4.5, 'Sugarcane & Soybean', 250, 'farmer', '2026-09-12 05:29:18')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  salt = EXCLUDED.salt,
  kisan_coins = EXCLUDED.kisan_coins;

-- 2. Seed Addresses (2 rows)
INSERT INTO addresses (id, user_id, full_name, phone, address_type, street, village, district, state, pincode, instructions, is_default, created_at)
VALUES ('addr-1', 'farmer-demo', 'Ramesh Patil', '9822012345', 'Farm Gate / Land', 'Farm Plot No. 14, Gat 204, Near Canal Siphon', 'Baramati Rural, Post Malegaon', 'Pune', 'Maharashtra', '413115', 'Drive tractor road beside primary school. Call 30 mins before arrival.', true, '2026-09-12 05:29:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO addresses (id, user_id, full_name, phone, address_type, street, village, district, state, pincode, instructions, is_default, created_at)
VALUES ('addr-2', 'farmer-demo', 'Ramesh Patil', '9822012345', 'Village Home / Kendra', 'House No. 42, Bazar Galli, Near Gram Panchayat', 'Baramati Town', 'Pune', 'Maharashtra', '413102', 'Delivery accepted between 8 AM to 8 PM.', false, '2026-09-12 05:29:18')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Coupons (3 rows)
INSERT INTO coupons (code, discount_percent, max_discount, min_order_amount, description, active, usage_count, created_at)
VALUES ('KISAN10', 10, 250, 0, '10% Extra Farmers Discount on all fertilizers & bio inputs', true, 0, '2026-09-12 05:29:17')
ON CONFLICT (code) DO UPDATE SET
  discount_percent = EXCLUDED.discount_percent,
  max_discount = EXCLUDED.max_discount,
  min_order_amount = EXCLUDED.min_order_amount,
  description = EXCLUDED.description;
INSERT INTO coupons (code, discount_percent, max_discount, min_order_amount, description, active, usage_count, created_at)
VALUES ('FERTILE20', 20, 400, 0, '20% Mega Agri-Season Discount', true, 0, '2026-09-12 05:29:17')
ON CONFLICT (code) DO UPDATE SET
  discount_percent = EXCLUDED.discount_percent,
  max_discount = EXCLUDED.max_discount,
  min_order_amount = EXCLUDED.min_order_amount,
  description = EXCLUDED.description;
INSERT INTO coupons (code, discount_percent, max_discount, min_order_amount, description, active, usage_count, created_at)
VALUES ('GREENFARM', 15, 300, 0, '15% Organic Care & Soil amendment Special', true, 0, '2026-09-12 05:29:17')
ON CONFLICT (code) DO UPDATE SET
  discount_percent = EXCLUDED.discount_percent,
  max_discount = EXCLUDED.max_discount,
  min_order_amount = EXCLUDED.min_order_amount,
  description = EXCLUDED.description;

-- 4. Seed Products (25 rows)
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'npk-191919', 'Balanced NPK 19:19:19 100% Water Soluble', 'Kisan Shakti Agri', 'Water soluble fertilizer', 'Fertilizer', 'Vegetables, Paddy, Wheat & Fruit crops',
  749, 999, '5 kg', 'Amazon Choice · Bestseller', 'bg-sky-100 text-sky-800 border-sky-300',
  4.8, 1420, 8, true, 'Tomorrow by 2 PM', 'Kisan Krishi Kendra (Govt Authorized)',
  'Nitrogen 19%, Phosphorus 19%, Potassium 19% + Chelate Micronutrients', '19:19:19', '4 - 5 kg per acre via drip irrigation or 10g/L foliar spray', 'Drip irrigation / Foliar spray at active vegetative & flowering stage',
  'High-purity, fully water-soluble balanced NPK fertilizer enriched with essential chelated trace elements. Boosts vegetative growth, promotes lush canopy, root vigor, and increases fruit setting and grain weight significantly.', 'Store in dry moisture-proof bag. Avoid mixing with calcium fertilizers or copper hydroxide sprays.',
  '["100% instant solubility without nozzle clogging","Balanced N:P:K ratio perfect for all vegetative and flowering stages","Enriched with EDTA chelated trace minerals (Fe, Zn, Mn, Cu, B, Mo)","Compatible with most non-alkaline bio-stimulants and micronutrient sprays","Govt Certified FCO compliant with batch test QR code"]'::jsonb, '["Tomatoes","Paddy","Wheat","Chilli","Cotton","Sugarcane","Pomegranate","Red Gram","Green Gram"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/NPK_fertilizer.jpg/640px-NPK_fertilizer.jpg', '2026-09-12 04:02:18'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'neem-shield', 'Neem Shield Botanical 10,000 PPM Bio-Pesticide', 'GreenBio Protect', 'Natural protection', 'Natural protection', 'Cotton, Vegetables, Pulses, Fruit trees',
  389, 520, '1 L', '100% Organic Certified', 'bg-emerald-100 text-emerald-800 border-emerald-300',
  4.7, 940, 28, true, 'Delivery in 2 Days', 'AgriCare Organic Hub',
  'Cold pressed Pure Azadirachtin 10,000 PPM (1.0% w/w EC) + natural emulsifiers', NULL, '2.5 ml to 3 ml per Litre of water (400-500 ml per acre)', 'Foliar spray during early morning or late evening',
  'Broad-spectrum organic antifeedant, insect repellent, and oviposition deterrent. Controls whiteflies, aphids, jassids, thrips, caterpillars, and leaf miners without harming beneficial bees or earthworms.', 'Spray during cool hours (6-9 AM or after 5 PM). Wear eye protection during mixing.',
  '["Certified organic by Jaivik Bharat and NPOP","Zero synthetic chemical residue, ideal for export quality crops","Prevents pest immunity and egg hatching cycle","Safe for honey bees, ladybird beetles, and soil microbiome","Extended UV-stable residual repellent effect on leaf surfaces"]'::jsonb, '["Cotton","Brinjal","Okra","Cabbage","Soybean","Mango","Red Gram","Green Gram","Tomato","Chilli"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Neem_oil.jpg/640px-Neem_oil.jpg', '2026-09-12 04:02:18'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'enriched-compost', 'Enriched Farm Compost & Microbial Humus', 'Dharti Ratna Organics', 'Soil amendment', 'Soil amendment', 'All Field, Fruit & Plantation Crops',
  499, 650, '25 kg', 'Soil Health Card Approved', 'bg-amber-100 text-amber-900 border-amber-300',
  4.9, 810, 45, true, 'Delivery in 3 Days (Heavy Vehicle)', 'Dharti Agri Cooperative',
  'Aerobically composted farm biomass, enriched with Humic Acid 6%, Fulvic Acid, beneficial Trichoderma & mycorrhiza', NULL, '100 - 200 kg per acre during field preparation or around root basin', 'Soil broadcasting before sowing or side dressing along crop rows',
  'Fully aged, odorless microbial compost rich in organic carbon and humus. Rejuvenates depleted soils, boosts water retention in sandy soils, improves aeration in heavy black soils, and activates native earthworms.', 'Incorporate into top 4-6 inches of soil and irrigate lightly for rapid microbial colonization.',
  '["Increases soil organic carbon (SOC) levels from depleted 0.3% to healthy >0.8%","Improves water holding capacity by up to 35%, cutting irrigation frequency","Rich in slow-release micro and macro nutrients","Completely weed-seed free and pathogen-free (pasteurized composting)","Bulk farmer package with moisture-lock inner liner"]'::jsonb, '["All Field Crops","Horticulture","Orchards","Floriculture"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Compost_in_hand.jpg/640px-Compost_in_hand.jpg', '2026-09-12 04:02:18'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'trichoderma-guard', 'Trichoderma Bio Guard 2x10^8 CFU/g Fungicide', 'BioShield Agro', 'Biological soil care', 'Biological soil care', 'Roots, Seedlings, Pulses, Ginger, Turmeric',
  299, 399, '1 kg', 'Biological Root Shield', 'bg-lime-100 text-lime-900 border-lime-300',
  4.8, 650, 30, true, 'Tomorrow by 4 PM', 'AgriBio Science Lab',
  'Trichoderma viride viable spores (2 x 10^8 CFU/g min) on carrier talc base', NULL, 'Seed treatment: 10g/kg seed; Soil application: 2-3 kg/acre mixed in 100kg compost', 'Seed dressing, seedling root dip, or drenching around root zones',
  'Potent biological antagonist and plant growth promoting fungus. Attacks, parasitizes, and destroys soil-borne fungal pathogens causing root rot, collar rot, damping-off, and Fusarium wilt.', 'Do not mix with chemical systemic fungicides (Carbendazim/Mancozeb) within 7 days.',
  '["High spore viability CFU count tested in university agri labs","Controls Fusarium, Pythium, Rhizoctonia, and Sclerotium rot","Produces natural plant growth hormones stimulating deep root hair growth","Compatible with FYM, compost, and bio-fertilizers","Safe for organic and conventional regenerative farming"]'::jsonb, '["Ginger","Turmeric","Chickpea","Tomato","Banana","Chilli","Groundnut","Red Gram"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Trichoderma_reesei_on_PDA_plate.jpg/640px-Trichoderma_reesei_on_PDA_plate.jpg', '2026-09-12 04:02:18'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'yellow-sticky-traps', 'Yellow & Blue Sticky Trap Pest Monitoring Kit', 'AgriTrap Pro', 'Monitoring tool', 'Monitoring tool', 'Protected crops, Polyhouses, Open fields',
  219, 320, '20 traps (15 Yellow + 5 Blue)', 'Pest IPM Essential', 'bg-violet-100 text-violet-800 border-violet-300',
  4.6, 430, 50, true, 'Tomorrow by 11 AM', 'Kisan Tool Mart',
  'UV-resistant recyclable polymer sheet coated with non-drying insect adhesive glue on both sides', NULL, '15 - 20 traps per acre placed at crop canopy height', 'Hang using supplied galvanized wire ties just above crop canopy',
  'Dual-action insect monitoring and mass trapping kit. Bright spectral yellow traps catch whiteflies, aphids, fungus gnats, and leaf miners, while blue traps specifically attract and trap destructive thrips.', 'Place traps 15-20 cm above growing plant tips. Replace when 70% covered with pests.',
  '["Weather-proof, non-melting adhesive lasts up to 60 days in direct sun and rain","Pre-punched holes with 20 metallic hanging wires included in box","Monitors pest arrival early before visual crop damage occurs","Reduces need for costly chemical pesticide sprays by up to 50%","Double sided high-stick surface with easy peel protective liners"]'::jsonb, '["Polyhouse vegetables","Open field crops","Orchards","Nurseries","Tomato","Capsicum","Chilli","Cucumber"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Yellow_sticky_trap_in_tomato.jpg/640px-Yellow_sticky_trap_in_tomato.jpg', '2026-09-12 04:02:18'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'mop-potash', 'Muriate of Potash (MOP) 60% K2O Fertilizer', 'Bharat Potash Corp', 'Potassium fertilizer', 'Fertilizer', 'Sugarcane, Banana, Potato, Paddy, Fruits',
  579, 750, '10 kg', 'High Potash 60%', 'bg-slate-100 text-slate-800 border-slate-300',
  4.7, 520, 22, true, 'Delivery in 2 Days', 'Bharat Agri Inputs Ltd',
  'Potassium Chloride (Potash as K2O min 60.0%) crystalline granular form', '0:0:60', '25 - 40 kg per acre in 2 split applications during tuber/fruit sizing', 'Soil broadcasting followed by immediate irrigation',
  'High-grade potassium fertilizer essential for carbohydrate synthesis, water regulation in drought stress, disease resistance, and enhancement of fruit size, shine, sweetness (Brix value), and grain firmness.', 'Avoid direct contact with seeds during sowing. Irrigate immediately after soil application.',
  '["Standard FCO Grade 60% water soluble potash","Promotes uniform tuber sizing in potato and bulb firmness in onion","Strengthens crop stalks against lodging in windy monsoon conditions","Enhances pest and fungal resistance by thickening plant cell walls","Tested for low moisture and zero caking"]'::jsonb, '["Sugarcane","Banana","Potato","Cotton","Maize","Paddy","Onion","Tomato"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Potassium_chloride.jpg/640px-Potassium_chloride.jpg', '2026-09-12 04:02:18'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'chelated-micronutrient', 'Multi-Micronutrient Chelate Combo (Zn, Fe, B, Mn)', 'Kisan Ratna Micronutrients', 'Micronutrient fertilizer', 'Micronutrient', 'Citrus, Paddy, Cotton, Vegetables, Pulses',
  349, 480, '500 g', 'Instant Leaf Greening', 'bg-emerald-100 text-emerald-900 border-emerald-300',
  4.9, 390, 19, true, 'Tomorrow by 1 PM', 'Kisan Krishi Kendra (Govt Authorized)',
  'EDTA Zinc 5%, EDTA Iron 4%, Boron 2%, Manganese 2%, Copper 0.5%, Molybdenum 0.05%', NULL, '1 to 1.5 g per Litre of water (200-250 g per acre spray)', 'Foliar spray during active flush and pre-flowering stage',
  'Fully chelated multi-micronutrient formula specifically designed to correct chlorosis, yellowing, leaf bronzing, and micro-deficiencies. 100% bio-available to plants within 48 hours of foliar spray.', 'Do not spray in harsh midday sun. Best sprayed early morning.',
  '["EDTA chelation prevents nutrients from getting locked in high pH alkaline soils","Rapidly reverses leaf yellowing and stunted shoot growth","Boosts chlorophyll synthesis and photosynthesis rate","Compatible with commonly used water-soluble NPK sprays","Dissolves clear instantly in cold spray water"]'::jsonb, '["Paddy (Khaira disease)","Citrus (Yellowing)","Cotton (Red leaf disease)","Vegetables","Chilli","Green Gram"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Chelated_micronutrient_fertilizer.jpg/640px-Chelated_micronutrient_fertilizer.jpg', '2026-09-12 04:02:18'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'urea-46', 'Urea 46% N Prilled (FCO Grade)', 'IFFCO / Rashtriya Chemicals', 'Nitrogen fertilizer', 'Fertilizer', 'Paddy, Wheat, Maize, Sugarcane, Vegetables',
  499, 599, '25 kg', 'Govt Subsidized MRP', 'bg-sky-100 text-sky-800 border-sky-300',
  4.7, 3200, 80, true, 'Delivery in 2 Days', 'Kisan Krishi Kendra (Govt Authorized)',
  'Nitrogen (as Urea) 46% minimum, prilled granular form', '46:0:0', '25–50 kg per acre in 2–3 split doses', 'Soil broadcasting and incorporation before irrigation; avoid foliar at flowering',
  'India''s most widely used nitrogen fertilizer. Prilled urea dissolves rapidly in soil moisture, releasing ammonical nitrogen that boosts vegetative growth, leaf area, and tiller count in cereals.', 'Avoid applying just before heavy rain or irrigation — volatilization losses increase. Do not apply when soil is waterlogged.',
  '["Highest nitrogen content (46%) among solid N fertilizers","IFFCO prilled — uniform 2–4 mm granule size for broadcast spreader","FCO Grade A certified with batch number and QR code","Essential for first topdressing in paddy after transplanting","Split application reduces losses — use 2–3 doses for best results"]'::jsonb, '["Paddy","Wheat","Maize","Sugarcane","Cotton","Red Gram","Green Gram","Vegetables"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Urea_ball.jpg/640px-Urea_ball.jpg', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'dap-1846', 'DAP 18:46:0 Di-Ammonium Phosphate', 'IFFCO DAP', 'Phosphatic fertilizer', 'Fertilizer', 'Wheat, Paddy, Pulses, Oilseeds, Vegetables',
  1399, 1599, '50 kg', 'Most Used Basal Fertilizer', 'bg-slate-100 text-slate-800 border-slate-300',
  4.9, 5100, 60, true, 'Delivery in 2 Days (Heavy)', 'Kisan Krishi Kendra (Govt Authorized)',
  'Nitrogen 18%, Phosphorus (P2O5) 46% — granular form', '18:46:0', '40–60 kg per acre as basal (at sowing/transplanting)', 'Basal application in seed furrows at sowing time; avoid direct seed contact',
  'India''s most popular basal fertilizer providing both nitrogen and high phosphorus for root development, early establishment, and flowering. Essential for pulse crops and oilseeds.', 'Place in seed furrow 2–3 cm away from seeds. Direct contact with seed causes germination damage.',
  '["46% phosphorus — highest P content in any granular fertilizer","Promotes strong root system development and nodule formation in pulses","IFFCO granular form — uniform distribution, low dust","Ideal for Rabi crops like wheat, gram, and mustard as basal dose","Water-soluble phosphate ions immediately available to young roots"]'::jsonb, '["Wheat","Paddy","Red Gram","Green Gram","Chickpea","Soybean","Groundnut","Mustard","Tomato","Onion"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Diammonium_phosphate.jpg/640px-Diammonium_phosphate.jpg', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'imidacloprid-17sl', 'Imidacloprid 17.8% SL — Systemic Insecticide', 'Agrow CropScience', 'Systemic insecticide', 'Insecticide', 'Paddy, Chilli, Cotton, Vegetables, Pulses',
  349, 480, '250 ml', 'WHO Class II Approved', 'bg-red-100 text-red-800 border-red-300',
  4.7, 2100, 35, true, 'Tomorrow by 3 PM', 'Agrow CropScience Dealer Network',
  'Imidacloprid 17.8% SL (Systemic neonicotinoid)', NULL, '100–125 ml per acre in 200L water (0.5 ml/L spray)', 'Foliar spray or soil drench at first pest appearance',
  'Highly effective systemic neonicotinoid insecticide that moves through plant tissues to kill sucking pests feeding on leaves, stems, and roots. Controls BPH in paddy, jassids in cotton, and whiteflies in vegetables.', 'Highly toxic to honeybees — do not spray during flowering. Do not apply near water bodies. Use full PPE (gloves, mask, goggles). PHI: 14 days.',
  '["Systemic action — absorbed through roots and leaves for complete plant protection","Residual activity up to 14–21 days after single application","Controls all sucking pest complex (BPH, WBPH, thrips, aphids, jassids)","Also effective as soil treatment for termite control and white grub","CIB registered for major Indian crops"]'::jsonb, '["Paddy","Chilli","Cotton","Brinjal","Tomato","Okra","Wheat","Sugarcane"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Imidacloprid.svg/320px-Imidacloprid.svg.png', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'chlorpyrifos-20ec', 'Chlorpyrifos 20% EC — Broad Spectrum Insecticide', 'Dhanuka AgroStar', 'Contact insecticide', 'Insecticide', 'Cotton, Chilli, Red Gram, Paddy, Vegetables',
  299, 420, '500 ml', 'Proven Broad Spectrum', 'bg-red-100 text-red-800 border-red-300',
  4.6, 1820, 40, true, 'Delivery in 2 Days', 'Dhanuka Agri Dealer',
  'Chlorpyrifos 20% EC (Organophosphate contact insecticide)', NULL, '300–400 ml per acre in 200L water (2 ml/L)', 'Foliar spray targeting caterpillars and stem borers; soil drench for termites',
  'Classic broad-spectrum organophosphate contact insecticide with proven efficacy against caterpillars, borers, termites, and soil insects. Controls pod borer in red gram, stem borer in paddy, and bollworm in cotton.', 'WHO Class II moderately hazardous. Wear full PPE. PHI: 15 days for vegetables, 21 days for paddy. Avoid contaminating water sources.',
  '["Broad contact and stomach action against chewing insects","Effective against diamond back moth (DBM) in brassicas","Soil treatment controls white grub and termite colony","Long-standing proven molecule with 50+ years of efficacy data","Compatible with most common fungicide sprays"]'::jsonb, '["Cotton","Chilli","Red Gram","Green Gram","Paddy","Sugarcane","Maize","Wheat"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chlorpyrifos_structure.svg/320px-Chlorpyrifos_structure.svg.png', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'emamectin-benzoate-5sg', 'Emamectin Benzoate 5% SG — Caterpillar Specialist', 'Syngenta Proclaim', 'Biological-derived insecticide', 'Insecticide', 'Vegetables, Chilli, Cotton, Cabbage, Okra',
  419, 580, '100 g', 'Best for Caterpillars', 'bg-orange-100 text-orange-800 border-orange-300',
  4.9, 1480, 25, true, 'Tomorrow by 2 PM', 'Syngenta Auth. Dealer',
  'Emamectin Benzoate 5% SG (Macrocyclic lactone — avermectin derivative)', NULL, '100–150 g per acre in 200L water (0.5g/L)', 'Foliar spray targeting caterpillar infestation',
  'Premium macrocyclic lactone insecticide derived from soil bacteria. Paralyzes and kills caterpillars with translaminar action — even hidden caterpillars feeding inside leaves or rolled leaf shelters are controlled.', 'Keep away from water bodies — highly toxic to aquatic life. Observe strict 5-day PHI for leafy vegetables. Wear PPE during application.',
  '["Translaminar action reaches caterpillars hidden inside folded leaves","Long residual: 14–18 days protection after single spray","Macrocyclic lactone with unique mode of action — no cross-resistance with organophosphates","Extremely effective against diamond back moth (DBM) resistant to other insecticides","Suitable for IPM programs — selective against beneficial insects at recommended rates"]'::jsonb, '["Cabbage","Cauliflower","Tomato","Chilli","Cotton","Okra","Brinjal","Red Gram"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Emamectin_benzoate.svg/320px-Emamectin_benzoate.svg.png', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'lambda-cyhalothrin-5ec', 'Lambda-Cyhalothrin 5% EC — Pyrethroid Insecticide', 'Syngenta Karate', 'Pyrethroid contact insecticide', 'Insecticide', 'Wheat, Cotton, Pulses, Soybean, Maize',
  269, 380, '250 ml', 'Quick Knockdown Action', 'bg-yellow-100 text-yellow-800 border-yellow-300',
  4.7, 960, 32, true, 'Tomorrow by 4 PM', 'Syngenta Auth. Dealer',
  'Lambda-Cyhalothrin 5% EC (Pyrethroid contact & stomach insecticide)', NULL, '200–300 ml per acre in 200L water (1–1.5 ml/L)', 'Foliar spray targeting external feeding insects',
  'Fast-acting pyrethroid insecticide with excellent knockdown speed. Controls armyworms, aphids, jassids, and pod borers with quick contact action. Low dose requirement and wide crop compatibility.', 'Toxic to fish and aquatic life. Maintain 50m buffer from water bodies. Avoid spraying during bee activity hours. PHI: 14 days for most crops.',
  '["Rapid knockdown within 30–60 minutes of spray contact","Repellent activity prevents re-infestation for 7–10 days","Low dose rate — highly cost-effective per acre","Compatible with most fungicides for tank mixing","WHO Class II approved for use in Indian agriculture"]'::jsonb, '["Wheat","Maize","Soybean","Cotton","Red Gram","Green Gram","Sunflower","Potato"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Lambda-cyhalothrin.svg/320px-Lambda-cyhalothrin.svg.png', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'acephate-75sp', 'Acephate 75% SP — Chilli & Cotton Insecticide', 'BASF Starthene', 'Systemic organophosphate insecticide', 'Insecticide', 'Chilli, Cotton, Tobacco, Vegetables, Groundnut',
  289, 399, '250 g', 'Chilli Specialist', 'bg-red-100 text-red-800 border-red-300',
  4.7, 1240, 28, true, 'Delivery in 2 Days', 'BASF Auth. Dealer',
  'Acephate 75% SP (Organophosphate systemic insecticide)', NULL, '300–400 g per acre in 200L water (1.5–2 g/L)', 'Foliar spray targeting sucking and chewing pests',
  'Versatile systemic organophosphate insecticide with both contact and systemic action. Highly effective against thrips, mites, aphids, and whiteflies in chilli — the most recommended insecticide for chilli thrips control in India.', 'WHO Class II. Full PPE mandatory. PHI: 7 days for chilli, 14 days for cotton. Not for use near water bodies.',
  '["Systemic + contact dual action for thorough pest control","Highly effective against thrips in chilli and cotton","Controls mites in tandem with acaricides","Soluble powder — clean and easy to measure and dissolve","Good compatibility with most agricultural pesticides"]'::jsonb, '["Chilli","Cotton","Groundnut","Tobacco","Tomato","Brinjal","Capsicum"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Acephate.svg/320px-Acephate.svg.png', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'spinosad-45sc', 'Spinosad 45% SC — Bio-derived IPM Insecticide', 'Dow Tracer', 'Macrocyclic lactone bio-insecticide', 'Bio-pesticide', 'Vegetables, Fruit crops, Chilli, Cotton, Paddy',
  899, 1199, '100 ml', 'Certified for Organic IPM', 'bg-green-100 text-green-900 border-green-300',
  4.8, 720, 18, true, 'Tomorrow by 2 PM', 'Dow AgroSciences Dealer',
  'Spinosad 45% SC (natural product from Saccharopolyspora spinosa fermentation)', NULL, '60–80 ml per acre in 200L water (0.3–0.4 ml/L)', 'Foliar spray targeting caterpillars and thrips',
  'Premium bio-derived insecticide from natural soil bacteria fermentation. Suitable for organic certification programs. Highly effective against thrips and caterpillars while being safe to beneficial insects, bees, and parasitoids.', 'Avoid spraying during bee activity. Mildly toxic to aquatic crustaceans. PHI: 3 days for vegetables — short pre-harvest interval is major advantage.',
  '["Natural fermentation product — approved for organic farming (Jaivik Bharat)","Dual mode of action: excitatory followed by paralysis in pests","Safe for bees and beneficial insects at recommended rates","Zero cross-resistance with organophosphates and pyrethroids","Excellent for IPM programs as non-toxic rotation partner"]'::jsonb, '["Tomato","Chilli","Cabbage","Cotton","Mango","Paddy","Okra"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Spinosad_A.svg/320px-Spinosad_A.svg.png', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'profenofos-50ec', 'Profenofos 50% EC — Cotton Bollworm Control', 'Syngenta Curacron', 'Organophosphate insecticide', 'Insecticide', 'Cotton, Chilli, Soybean, Groundnut',
  349, 489, '500 ml', 'Cotton Standard', 'bg-red-100 text-red-800 border-red-300',
  4.8, 1560, 30, true, 'Delivery in 2 Days', 'Syngenta Auth. Dealer',
  'Profenofos 50% EC (Organophosphate-contact insecticide)', NULL, '400–500 ml per acre in 200L water (2 ml/L)', 'Foliar spray for bollworm and other pest control in cotton',
  'Industry-standard organophosphate insecticide for cotton bollworm management. Also effective on Spodoptera (armyworm) in soybean and groundnut. Combines contact and partial systemic action.', 'WHO Class II. Full PPE essential. PHI: 21 days for cotton. Avoid drift to non-target areas.',
  '["Standard cotton bollworm management insecticide in India","Effective against Helicoverpa armigera bollworm complex","Controls Spodoptera litura (tobacco caterpillar) in groundnut/soybean","Moderate systemic activity ensures coverage of hidden larvae","Cost-effective price point for large-scale cotton farmers"]'::jsonb, '["Cotton","Chilli","Soybean","Groundnut","Brinjal","Tomato"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Profenofos.svg/320px-Profenofos.svg.png', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'mancozeb-75wp', 'Mancozeb 75% WP — Multi-target Fungicide', 'Indofil M-45', 'Protective fungicide', 'Fungicide', 'Tomato, Chilli, Potato, Grapes, Onion, Paddy',
  249, 349, '500 g', 'India #1 Fungicide', 'bg-blue-100 text-blue-800 border-blue-300',
  4.8, 3800, 55, true, 'Tomorrow by 11 AM', 'Indofil Industries Dealer',
  'Mancozeb 75% WP (Dithiocarbamate multi-site protective fungicide)', NULL, '500–600 g per acre in 200L water (2.5–3 g/L)', 'Preventive foliar spray starting before disease onset',
  'India''s most widely used protective fungicide with multi-site action against a wide range of fungal diseases. Prevents early blight, late blight, downy mildew, anthracnose, and leaf spot in vegetables and fruits.', 'Avoid inhalation of dust. Wear N95 mask. PHI: 10 days for tomato, 15 days for grapes. Do not mix with alkaline products (Bordeaux mixture).',
  '["Multi-site action — extremely low resistance risk compared to single-site fungicides","Effective against Alternaria, Phytophthora, Downy Mildew, and Anthracnose","Also provides secondary zinc and manganese micronutrient benefit","Rain-fast within 2 hours of spray drying on leaf","Cost-effective — lowest cost per acre among fungicide molecules"]'::jsonb, '["Tomato","Chilli","Potato","Grapes","Onion","Paddy","Mango","Groundnut","Green Gram","Red Gram"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mancozeb.svg/320px-Mancozeb.svg.png', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'carbendazim-50wp', 'Carbendazim 50% WP — Systemic Fungicide', 'Bayer Bavistin', 'Systemic fungicide', 'Fungicide', 'Paddy, Wheat, Chilli, Tomato, Pulses, Banana',
  219, 299, '250 g', 'Proven Systemic Curative', 'bg-blue-100 text-blue-800 border-blue-300',
  4.6, 2450, 42, true, 'Tomorrow by 1 PM', 'Bayer CropScience Dealer',
  'Carbendazim 50% WP (Benzimidazole systemic fungicide)', NULL, '200–250 g per acre in 200L water (1–1.25 g/L)', 'Foliar spray or soil drench for seed-borne and soil-borne fungi',
  'Classic systemic benzimidazole fungicide with curative and protective action. Absorbed into plant system and translocates acropetally to control powdery mildew, sheath blight, Fusarium, and smut diseases.', 'Resistance developing in some pathogens — rotate with Propiconazole or Mancozeb. PHI: 7 days for vegetables. Avoid prolonged exposure.',
  '["Systemic curative action — controls existing infections, not just preventive","Excellent against powdery mildew in vegetables and Sheath Blight in paddy","Seed treatment controls seed-borne diseases (loose smut, Karnal bunt in wheat)","Soil drench application controls Fusarium wilt effectively","Broad spectrum: effective against 70+ fungal diseases"]'::jsonb, '["Paddy","Wheat","Chilli","Tomato","Green Gram","Red Gram","Banana","Maize"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Carbendazim.svg/320px-Carbendazim.svg.png', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'propiconazole-25ec', 'Propiconazole 25% EC — Paddy & Wheat Fungicide', 'Syngenta Tilt', 'Systemic triazole fungicide', 'Fungicide', 'Paddy, Wheat, Maize, Sugarcane, Banana',
  399, 549, '250 ml', 'Paddy Blast Specialist', 'bg-blue-100 text-blue-800 border-blue-300',
  4.9, 1950, 25, true, 'Tomorrow by 3 PM', 'Syngenta Auth. Dealer',
  'Propiconazole 25% EC (Triazole demethylation inhibitor fungicide)', NULL, '200 ml per acre in 200L water (1 ml/L)', 'Foliar spray at leaf blast or sheath rot appearance in paddy',
  'Premium triazole systemic fungicide from Syngenta. Industry standard for Paddy Blast (Magnaporthe oryzae), Sheath Rot, and Grain Discoloration control. Also controls Powdery Mildew and Rust in wheat.', 'PHI: 10 days for paddy. Triazoles may have plant regulatory effects at excess dose — do not exceed 1 ml/L. Wear PPE during spray.',
  '["Systemic sterol inhibitor — curative and preventive action against Blast","Also shows plant growth regulation (greening effect) at recommended doses","Long residual 14–21 days — fewer sprays needed per season","Key molecule for paddy blast management at heading stage","Controls False Smut in paddy and Leaf Rust in wheat"]'::jsonb, '["Paddy","Wheat","Maize","Sugarcane","Banana","Mango","Turmeric"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Propiconazole.svg/320px-Propiconazole.svg.png', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'metalaxyl-mancozeb', 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)', 'Syngenta Ridomil Gold', 'Systemic + Protective fungicide combination', 'Fungicide', 'Potato, Tomato, Ginger, Chilli, Grapes, Onion',
  549, 750, '250 g', 'Late Blight Specialist', 'bg-blue-100 text-blue-800 border-blue-300',
  4.9, 1340, 20, true, 'Tomorrow by 4 PM', 'Syngenta Auth. Dealer',
  'Metalaxyl 8% + Mancozeb 64% WP (Phenylamide + Dithiocarbamate combination)', NULL, '500–600 g per acre in 200L water (2.5–3 g/L)', 'Preventive foliar spray or soil drench for Oomycete disease control',
  'The gold standard for Late Blight (Phytophthora), Downy Mildew, and Pythium diseases. Metalaxyl (systemic) + Mancozeb (protective) combination provides both curative action inside plant and surface protection.', 'Metalaxyl resistance has developed in some Phytophthora strains — alternate with Cymoxanil. PHI: 7 days. Wear face mask when mixing.',
  '["Metalaxyl targets Oomycetes specifically (Phytophthora, Pythium, Peronospora)","Mancozeb provides broad-spectrum protective barrier","Systemic metalaxyl absorbed into plant for internal protection","Standard recommendation for late blight prevention in potato and tomato","Also as soil drench for Pythium damping-off in nurseries"]'::jsonb, '["Potato","Tomato","Ginger","Turmeric","Chilli","Grapes","Onion","Chilgoza"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Metalaxyl.svg/320px-Metalaxyl.svg.png', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'beauveria-bassiana', 'Beauveria bassiana 1.15% WP — Entomopathogenic Fungus', 'Biocontrol Labs BioMagic', 'Entomopathogenic fungus bio-pesticide', 'Bio-pesticide', 'Cotton, Chilli, Vegetables, Groundnut, Sugarcane',
  249, 349, '1 kg', 'Organic Certified IPM', 'bg-green-100 text-green-900 border-green-300',
  4.5, 480, 22, true, 'Delivery in 2 Days', 'Biocontrol Research Labs',
  'Beauveria bassiana 1.15% WP (minimum 2 x 10^8 viable spores per gram)', NULL, '2–3 kg per acre in 200L water (10–15 g/L)', 'Foliar spray or soil application for pest control',
  'Natural soil fungus that parasitizes and kills insects on contact. Spores germinate on pest cuticle, penetrate inside, and kill within 3–7 days. Effective against whiteflies, aphids, thrips, and some beetles without harming beneficials.', 'Store in cool location (4–15°C). Avoid mixing with chemical fungicides. Spray in evening — sunlight reduces spore viability.',
  '["Natural entomopathogenic fungus — OMRI listed for organic farming","Kills whiteflies, aphids, thrips, jassids by contact germination","Multiplies and spreads in pest population (secondary infection)","No resistance development — biological mode of action","Safe for farmers, consumers, birds, and beneficial insects"]'::jsonb, '["Cotton","Chilli","Tomato","Brinjal","Groundnut","Sugarcane","Red Gram"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Beauveria_bassiana.jpg/640px-Beauveria_bassiana.jpg', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'bacillus-thuringiensis', 'Bacillus thuringiensis (Bt) var. kurstaki WP', 'Neem Biotech Delfin', 'Bacterial bio-insecticide', 'Bio-pesticide', 'Cabbage, Cotton, Vegetables, Red Gram, Tomato',
  329, 449, '500 g', 'Zero Residue Organic', 'bg-green-100 text-green-900 border-green-300',
  4.7, 820, 28, true, 'Tomorrow by 3 PM', 'Biocontrol Research Labs',
  'Bacillus thuringiensis var. kurstaki (5000 IU/mg). Fermentation dried WP formulation', NULL, '500g–1 kg per acre in 200L water (2.5–5 g/L)', 'Foliar spray targeting young caterpillar larvae',
  'The world''s most widely used biological insecticide — natural soil bacterium that produces protein crystals (Cry toxins) lethal specifically to moth and butterfly larvae (Lepidoptera) while safe to all other organisms.', 'Store below 25°C away from direct sunlight. Use within 2 years of manufacture. Spray in evening or early morning for best results.',
  '["Highly specific — only kills caterpillar (Lepidoptera) larvae, no collateral damage","Zero residue — approved for use right up to harvest day","No pre-harvest interval — safe for direct consumption crops","Natural fermentation product — OMRI certified for organic farming","No known resistance development in field populations"]'::jsonb, '["Cabbage","Cauliflower","Cotton","Tomato","Red Gram","Green Gram","Soybean","Brinjal"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Bacillus_thuringiensis_phase.jpg/640px-Bacillus_thuringiensis_phase.jpg', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'zinc-sulphate-33', 'Zinc Sulphate 33% (Monohydrate) — Deficiency Corrector', 'Kisan Ratna ZnSO4', 'Micronutrient fertilizer', 'Micronutrient', 'Paddy, Wheat, Maize, Citrus, Vegetables',
  249, 349, '5 kg', 'FCO Certified Zinc', 'bg-yellow-100 text-yellow-900 border-yellow-300',
  4.7, 1260, 38, true, 'Tomorrow by 2 PM', 'Kisan Krishi Kendra (Govt Authorized)',
  'Zinc Sulphate Monohydrate (Zn 33% min, S 16%)', NULL, 'Soil: 10–25 kg per acre; Foliar: 5g/L + 2g/L lime', 'Soil broadcasting before sowing or foliar spray as 0.5% solution',
  'Essential zinc micronutrient corrector for Zinc-deficient soils prevalent across India. Zinc deficiency (Khaira) is the most widespread micronutrient deficiency in Indian paddy soils. Also provides sulphur (16%).', 'Do not mix with superphosphate in same spray tank. For foliar spray, always add equal quantity of lime to neutralize acidity.',
  '["Corrects Khaira disease (Zinc deficiency) in paddy rapidly","Provides dual nutrition: Zinc + Sulphur in one application","Improves grain quality, head formation, and crop maturity","FCO certified 33% Zinc content — higher than heptahydrate form","Can be applied via soil or foliar depending on severity"]'::jsonb, '["Paddy (Khaira)","Wheat","Maize","Citrus","Vegetables","Sugarcane","Onion"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Zinc_sulfate.jpg/640px-Zinc_sulfate.jpg', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'calcium-nitrate-19', 'Calcium Nitrate 19% N + 23% Ca — Fruit Quality Booster', 'Haifa CalciNit', 'Calcium-nitrogen fertilizer', 'Fertilizer', 'Tomato, Potato, Apple, Grape, Capsicum, Banana',
  549, 749, '5 kg', 'Blossom End Rot Cure', 'bg-sky-100 text-sky-800 border-sky-300',
  4.8, 870, 20, true, 'Tomorrow by 1 PM', 'Haifa Auth. Dealer',
  'Calcium Nitrate Ca(NO3)2 — Ca 23%, Nitrogen (Nitrate-N) 19%', NULL, '5–10 kg per acre via drip irrigation or 1–2 g/L foliar spray', 'Drip irrigation fertigation or foliar spray at fruit development stage',
  'Premium water-soluble calcium nitrate fertilizer that simultaneously corrects calcium deficiency and provides readily available nitrate nitrogen. Essential for preventing Blossom End Rot in tomato/capsicum and bitter pit in apple.', 'Do not mix with phosphate fertilizers, sulfates, or alkaline compounds in same tank — precipitates form. Apply through separate drip injection.',
  '["Prevents Blossom End Rot (BER) — #1 cause of tomato fruit loss","Provides 23% readily available calcium for cell wall strength","Nitrate-N form immediately available to plants (no conversion needed)","Reduces tip burn in lettuce and inner browning in cabbage","100% water soluble for drip fertigation systems"]'::jsonb, '["Tomato","Potato","Apple","Grapes","Capsicum","Banana","Strawberry","Mango"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Calcium_nitrate.jpg/640px-Calcium_nitrate.jpg', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;
INSERT INTO products (
  id, name, brand, type, category, crop, price, original_price, unit, badge, tone,
  rating, review_count, stock_count, in_stock, delivery_days, seller, composition,
  npk_ratio, dosage_per_acre, application_method, description, safety_advice,
  features_json, suitable_crops_json, image_url, created_at
) VALUES (
  'borax-20', 'Borax 20% (Sodium Tetraborate) — Boron Fertilizer', 'Kisan Ratna Boron', 'Boron micronutrient fertilizer', 'Micronutrient', 'Onion, Groundnut, Sunflower, Cotton, Rapeseed',
  199, 279, '2 kg', 'Hollow Stem Preventer', 'bg-yellow-100 text-yellow-900 border-yellow-300',
  4.6, 620, 35, true, 'Tomorrow by 3 PM', 'Kisan Krishi Kendra (Govt Authorized)',
  'Sodium Tetraborate (Borax) — Boron 10.5% water soluble', NULL, 'Soil: 2–3 kg per acre; Foliar: 0.5–1g/L (2–3 sprays)', 'Soil broadcasting before sowing or foliar spray at flowering stage',
  'Boron micronutrient fertilizer for crops prone to boron deficiency. Corrects hollow stem in cauliflower, poor pod setting in groundnut/mustard, and empty bolls in cotton caused by boron deficiency affecting pollen germination.', 'Very narrow margin between deficiency and toxicity. NEVER exceed recommended dose. Phytotoxicity occurs at >3g/L foliar concentration.',
  '["Prevents hollow stem in cauliflower and broccoli","Essential for pollen germination and fruit/seed setting","Corrects empty pods in groundnut and poor curd formation in cauliflower","Improves boll setting and lint development in cotton","Low dose requirement — small quantity covers entire acre"]'::jsonb, '["Onion","Groundnut","Sunflower","Cotton","Rapeseed/Mustard","Cauliflower","Apple","Sugarcane"]'::jsonb, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Borax_crystals_2.jpg/640px-Borax_crystals_2.jpg', '2026-09-12 06:17:58'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  stock_count = EXCLUDED.stock_count,
  in_stock = EXCLUDED.in_stock,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  image_url = EXCLUDED.image_url;

-- 5. Seed Market Listings (11 rows)
INSERT INTO market_listings (
  id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
  category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
  mandi_benchmark_price, msp_price, is_negotiable, quality_grade, moisture_percent, harvest_date,
  is_organic, packaging_type, logistics_mode, farm_gate_address, description, images_json,
  status, views_count, inquiries_count, created_at
) VALUES (
  'list-chilli-1', 'farmer-venkat', 'Venkateswara Rao', '+91 98480 23456', 'Kakumanu Village',
  'Guntur', 'Andhra Pradesh', 'spices', 'red-chilli', 'Dry Red Chilli (Guntur Teja S-17)',
  'Guntur Teja (S-17) Stemless', 45, 'Quintal (100 kg)', 5, 18500,
  18200, NULL, true, 'Grade A (Stemless Deep Red)',
  10.2, '2026-03-02', false, 'Jute Gunny Bags (50 kg)',
  'Farm Gate Pickup (Tractor/Truck Road)', 'Survey No. 42/B, Near Kakumanu Sub-Station, Guntur District', 'Pure Guntur Teja S-17 dry red chilli sun dried on clean tarpaulin. High heat pungency (ASTA color 95+), zero fungus, stemless de-stemmed clean lot. Ready for spice grinding or exporter container loading.',
  '["https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'ACTIVE', 145, 4, '2026-09-12 05:50:05'
) ON CONFLICT (id) DO UPDATE SET
  price_per_unit = EXCLUDED.price_per_unit,
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  inquiries_count = EXCLUDED.inquiries_count;
INSERT INTO market_listings (
  id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
  category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
  mandi_benchmark_price, msp_price, is_negotiable, quality_grade, moisture_percent, harvest_date,
  is_organic, packaging_type, logistics_mode, farm_gate_address, description, images_json,
  status, views_count, inquiries_count, created_at
) VALUES (
  'list-redgram-1', 'farmer-demo', 'Ramesh Patil', '+91 98220 12345', 'Ausa Rural',
  'Latur', 'Maharashtra', 'pulses', 'red-gram', 'Red Gram / Pigeon Pea (Maruti Tur Dal)',
  'Maruti (ICP 8863)', 35, 'Quintal (100 kg)', 5, 7650,
  7450, 7550, true, 'Grade A (FAQ Bold)',
  9.8, '2026-02-18', false, 'New HDPE Bags with Inner Liner',
  'Farm Gate Pickup + APMC Latur Mandi delivery available', 'Gat No. 118, Post Ausa, Latur-Solapur Highway', 'Clean harvested Maruti White/Red Tur. Big bold grains, thoroughly winnowed, zero pulse beetle. Moisture strictly 9.8% verified on digital moisture meter. Excellent dal recovery test ratio.',
  '["https://images.unsplash.com/photo-1585314062604-1a357de8b000?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'ACTIVE', 101, 3, '2026-09-12 05:50:05'
) ON CONFLICT (id) DO UPDATE SET
  price_per_unit = EXCLUDED.price_per_unit,
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  inquiries_count = EXCLUDED.inquiries_count;
INSERT INTO market_listings (
  id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
  category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
  mandi_benchmark_price, msp_price, is_negotiable, quality_grade, moisture_percent, harvest_date,
  is_organic, packaging_type, logistics_mode, farm_gate_address, description, images_json,
  status, views_count, inquiries_count, created_at
) VALUES (
  'list-greengram-1', 'farmer-akola', 'Santoshrao Gawande', '+91 97654 88123', 'Murtizapur',
  'Akola', 'Maharashtra', 'pulses', 'green-gram', 'Green Gram / Mung Bean (Vaibhav Moong)',
  'Vaibhav (PKV AKM-4)', 20, 'Quintal (100 kg)', 2, 8400,
  8200, 8558, true, 'Grade A (Shining Green)',
  9.2, '2026-03-01', true, 'Hermetic GrainPro Bags (50 kg)',
  'Farm Gate Pickup', 'Farm Plot 14, Near Murtizapur Railway Crossing, Akola', 'Certified Jaivik organic Green Gram. Lustrous shining green uniform grains, zero chemical spray during pod maturation. Superior 95%+ germination rate for sprouting or premium organic dal milling.',
  '["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'ACTIVE', 76, 1, '2026-09-12 05:50:05'
) ON CONFLICT (id) DO UPDATE SET
  price_per_unit = EXCLUDED.price_per_unit,
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  inquiries_count = EXCLUDED.inquiries_count;
INSERT INTO market_listings (
  id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
  category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
  mandi_benchmark_price, msp_price, is_negotiable, quality_grade, moisture_percent, harvest_date,
  is_organic, packaging_type, logistics_mode, farm_gate_address, description, images_json,
  status, views_count, inquiries_count, created_at
) VALUES (
  'list-tomato-1', 'farmer-kolar', 'Muniyappa Reddy', '+91 94481 67234', 'Malur Taluk',
  'Kolar', 'Karnataka', 'vegetables', 'tomato', 'Fresh Tomatoes (Shivam F1 Hybrid)',
  'Syngenta Shivam F1', 350, 'Crates (20-25 kg)', 25, 490,
  460, NULL, true, 'Grade A (Breaker / Pink Stage)',
  NULL, '2026-03-10', false, 'Plastic Crates (22-25 kg net)',
  'Farm Gate Pickup (Concrete Road, 10-wheeler accessible)', 'Doddanatha Farm, Malur Main Road, Kolar', 'Freshly harvested Shivam hybrid tomatoes picked at 4 AM daily. Firm thick-walled fruit at breaker pink stage, zero sun scald, uniform 80-100g size. Ideal for Chennai, Bengaluru, or Hyderabad dispatch with 4-day shelf life.',
  '["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'ACTIVE', 210, 4, '2026-09-12 05:50:05'
) ON CONFLICT (id) DO UPDATE SET
  price_per_unit = EXCLUDED.price_per_unit,
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  inquiries_count = EXCLUDED.inquiries_count;
INSERT INTO market_listings (
  id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
  category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
  mandi_benchmark_price, msp_price, is_negotiable, quality_grade, moisture_percent, harvest_date,
  is_organic, packaging_type, logistics_mode, farm_gate_address, description, images_json,
  status, views_count, inquiries_count, created_at
) VALUES (
  'list-onion-1', 'farmer-nashik', 'Bhausaheb Dhatrak', '+91 98230 45678', 'Niphad',
  'Nashik', 'Maharashtra', 'vegetables', 'onion', 'Nashik Red Onion (Garwa Summer Crop)',
  'Nashik Red (Garwa)', 120, 'Quintal (100 kg)', 10, 2400,
  2350, NULL, true, 'Grade A (Patti Golta 55mm+)',
  11.5, '2026-03-05', false, 'Red Net Mesh Bags (50 kg)',
  'Farm Gate Godown (Lasalgaon Mandi 8 km away)', 'Kanda Chawl Compound, Gat 401, Niphad-Lasalgaon Road', 'Famous Nashik Garwa summer onion stored in well-ventilated Kanda Chawl. Strong dark red skin, single thin dried neck, 55mm to 65mm bold size. Long shelf life guaranteed for 4-5 months without rotting or sprouting.',
  '["https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'ACTIVE', 185, 3, '2026-09-12 05:50:05'
) ON CONFLICT (id) DO UPDATE SET
  price_per_unit = EXCLUDED.price_per_unit,
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  inquiries_count = EXCLUDED.inquiries_count;
INSERT INTO market_listings (
  id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
  category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
  mandi_benchmark_price, msp_price, is_negotiable, quality_grade, moisture_percent, harvest_date,
  is_organic, packaging_type, logistics_mode, farm_gate_address, description, images_json,
  status, views_count, inquiries_count, created_at
) VALUES (
  'list-pom-1', 'farmer-solapur', 'Digambar Shinde', '+91 98229 11223', 'Sangola',
  'Solapur', 'Maharashtra', 'fruits', 'pomegranate', 'Bhagwa Pomegranates (Ruby Red Arils)',
  'Bhagwa (Solapur GI)', 5000, 'Kg', 500, 98,
  92, NULL, true, 'Grade A (Export Supreme 350g+)',
  NULL, '2026-03-08', false, '5-Ply Corrugated Export Cartons (3.5 kg / 9-12 count)',
  'Farm Gate Cold-Prepped Shed', 'Shinde Agri Orchards, Sangola-Miraj Road, Solapur', 'GI Certified Solapur Bhagwa pomegranates. Spotless glowing crimson skin, soft ruby red juicy seeds, high Brix 16.5°. Hand graded by electronic weight sizer. Global GAP compliant orchard practices.',
  '["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'ACTIVE', 160, 2, '2026-09-12 05:50:05'
) ON CONFLICT (id) DO UPDATE SET
  price_per_unit = EXCLUDED.price_per_unit,
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  inquiries_count = EXCLUDED.inquiries_count;
INSERT INTO market_listings (
  id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
  category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
  mandi_benchmark_price, msp_price, is_negotiable, quality_grade, moisture_percent, harvest_date,
  is_organic, packaging_type, logistics_mode, farm_gate_address, description, images_json,
  status, views_count, inquiries_count, created_at
) VALUES (
  'list-mango-1', 'farmer-konkan', 'Suhas Kelkar', '+91 94224 55667', 'Devgad Coastal Belt',
  'Ratnagiri', 'Maharashtra', 'fruits', 'mango', 'Devgad Alphonso Mango (Naturally Ripened Hapus)',
  'Devgad Hapus (GI Certified)', 150, 'Crates (20-25 kg)', 5, 1350,
  1250, NULL, true, 'Grade A (GI Certified Export)',
  NULL, '2026-03-12', true, 'Traditional Wooden Pitaras with Paddy Straw Lining',
  'Farm Gate / Mumbai Goa Highway pickup point', 'Kelkar Sea-Breeze Mango Estate, Devgad, Sindhudurg/Ratnagiri Border', 'Original Devgad coastal Alphonso with GI authentication QR tag on every box. Tree ripened in clean rice straw without harmful chemicals or carbide. Heavenly saffron aroma, rich saffron pulp with zero fiber.',
  '["https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'ACTIVE', 340, 6, '2026-09-12 05:50:05'
) ON CONFLICT (id) DO UPDATE SET
  price_per_unit = EXCLUDED.price_per_unit,
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  inquiries_count = EXCLUDED.inquiries_count;
INSERT INTO market_listings (
  id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
  category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
  mandi_benchmark_price, msp_price, is_negotiable, quality_grade, moisture_percent, harvest_date,
  is_organic, packaging_type, logistics_mode, farm_gate_address, description, images_json,
  status, views_count, inquiries_count, created_at
) VALUES (
  'list-wheat-1', 'farmer-sehore', 'Rajendra Singh Chauhan', '+91 94250 33445', 'Ashta Tehsil',
  'Sehore', 'Madhya Pradesh', 'grains', 'wheat', 'MP Sharbati Golden Wheat (Grain of Gold)',
  'MP Sharbati C-306', 80, 'Quintal (100 kg)', 10, 2950,
  2850, 2275, true, 'Grade A (Sharbati Premium Gold)',
  9.5, '2026-03-01', false, 'Jute Gunny Bags (50 kg)',
  'Farm Gate & Warehousing Godown with e-NWR available', 'Village Khajuria, Ashta, Bhopal-Indore Highway, Sehore', 'Genuine Sehore Sharbati wheat grown in deep rich black cotton soil. Heavy golden translucent grain, 13.2% natural protein, gives softest rotis that stay fresh for 24 hours. Certified lab tested lot.',
  '["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'ACTIVE', 125, 2, '2026-09-12 05:50:05'
) ON CONFLICT (id) DO UPDATE SET
  price_per_unit = EXCLUDED.price_per_unit,
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  inquiries_count = EXCLUDED.inquiries_count;
INSERT INTO market_listings (
  id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
  category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
  mandi_benchmark_price, msp_price, is_negotiable, quality_grade, moisture_percent, harvest_date,
  is_organic, packaging_type, logistics_mode, farm_gate_address, description, images_json,
  status, views_count, inquiries_count, created_at
) VALUES (
  'list-banana-1', 'farmer-jalgaon', 'Pravin Patil', '+91 98901 77889', 'Raver',
  'Jalgaon', 'Maharashtra', 'fruits', 'banana', 'Tissue Culture Grand Naine Bananas (G-9 Export Bunch)',
  'Grand Naine (G-9)', 18, 'Metric Ton (1000 kg)', 3, 17500,
  16500, NULL, true, 'Grade A (Export Bunch Hands)',
  NULL, '2026-03-11', false, 'Reefer Foam Pad Crates / Field Bunch Loading',
  'Direct Field Gate Loading on 16-wheel trailer', 'Patil Farms, Near Tapi River Canal, Raver, Jalgaon', 'Premium G-9 tissue culture bananas harvested at 85% maturity. Clean blemish-free fingers, uniform 8-10 hands per bunch, calibrated finger thickness. Ready for Delhi, Punjab, or Gulf container reefer shipment.',
  '["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'ACTIVE', 88, 1, '2026-09-12 05:50:05'
) ON CONFLICT (id) DO UPDATE SET
  price_per_unit = EXCLUDED.price_per_unit,
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  inquiries_count = EXCLUDED.inquiries_count;
INSERT INTO market_listings (
  id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
  category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
  mandi_benchmark_price, msp_price, is_negotiable, quality_grade, moisture_percent, harvest_date,
  is_organic, packaging_type, logistics_mode, farm_gate_address, description, images_json,
  status, views_count, inquiries_count, created_at
) VALUES (
  'list-cotton-1', 'farmer-wardha', 'Kailashrao Wanjari', '+91 97632 99881', 'Seloo',
  'Wardha', 'Maharashtra', 'cash_crops', 'cotton', 'Raw Seed Cotton / Kapas (Long Staple Bt Cotton)',
  'Bt Cotton (Bollgard II)', 60, 'Quintal (100 kg)', 10, 7450,
  7400, 7121, true, 'Grade A (Long Staple 29.5mm+)',
  8.5, '2026-02-25', false, 'Loose Covered Truck / Trolley',
  'Farm Gate & Wardha Mandi delivery available', 'Seloo Farm Compound, Nagpur-Wardha Highway', 'First-pick pure white long staple cotton. Free from yellow stains, low trash content (<2.5%), high ginning turnout ratio. Stored on raised concrete shed with zero moisture damage.',
  '["https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'ACTIVE', 110, 3, '2026-09-12 05:50:05'
) ON CONFLICT (id) DO UPDATE SET
  price_per_unit = EXCLUDED.price_per_unit,
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  inquiries_count = EXCLUDED.inquiries_count;
INSERT INTO market_listings (
  id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
  category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
  mandi_benchmark_price, msp_price, is_negotiable, quality_grade, moisture_percent, harvest_date,
  is_organic, packaging_type, logistics_mode, farm_gate_address, description, images_json,
  status, views_count, inquiries_count, created_at
) VALUES (
  'list-red-gram-mtxyyfas', 'farmer-demo', 'Farmer Partner', '+91 98220 12345', 'Ausa Rural',
  'Latur', 'Maharashtra', 'vegetables', 'red-gram', 'Maruti Red Gram / Tur Dal (Grade A)',
  'Maruti ICP 8863', 40, 'Quintal (100 kg)', 1, 7700,
  NULL, NULL, true, 'Grade A',
  NULL, '2026-09-12', false, 'Standard Gunny / Crates',
  'Farm Gate Pickup', 'Ausa Rural, Latur', 'Freshly harvested Maruti Red Gram / Tur Dal (Grade A) directly from farmer.',
  '["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'ACTIVE', 3, 0, '2026-09-12 05:53:14'
) ON CONFLICT (id) DO UPDATE SET
  price_per_unit = EXCLUDED.price_per_unit,
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  inquiries_count = EXCLUDED.inquiries_count;

-- 6. Seed Market Inquiries (5 rows)
INSERT INTO market_inquiries (
  id, listing_id, buyer_name, buyer_phone, buyer_type, buyer_location,
  offered_price_per_unit, requested_quantity, message, status, created_at
) VALUES (
  'inq-1', 'list-chilli-1', 'Sri Balaji Spices & Export Ltd (Anand Kumar)', '+91 98490 88776', 'Spice Exporter / Grinding Mill',
  'Guntur Mandi Yard, AP', 18200, 30, 'We need 30 Quintals for our Hyderabad processing unit. Can dispatch container tomorrow morning. Please confirm price.',
  'PENDING', '2026-09-12 05:50:05'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO market_inquiries (
  id, listing_id, buyer_name, buyer_phone, buyer_type, buyer_location,
  offered_price_per_unit, requested_quantity, message, status, created_at
) VALUES (
  'inq-2', 'list-redgram-1', 'Venkateshwara Dal Industries (Prakash Jhavar)', '+91 98225 33441', 'Dal Mill Owner',
  'MIDC Latur, Maharashtra', 7550, 25, 'We tested sample dal recovery at 74%. Ready to lift 25 quintals at MSP price ₹7,550 with immediate RTGS payment upon weighing.',
  'ACCEPTED', '2026-09-12 05:50:05'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO market_inquiries (
  id, listing_id, buyer_name, buyer_phone, buyer_type, buyer_location,
  offered_price_per_unit, requested_quantity, message, status, created_at
) VALUES (
  'inq-3', 'list-tomato-1', 'Metro Fresh Supply Chains (Suresh Babu)', '+91 99001 44552', 'Retail Chain Vendor',
  'Yeshwanthpur APMC, Bengaluru', 480, 150, 'Need 150 crates for Saturday morning distribution across Bengaluru retail outlets. Sending our refrigerated vehicle.',
  'PENDING', '2026-09-12 05:50:05'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO market_inquiries (
  id, listing_id, buyer_name, buyer_phone, buyer_type, buyer_location,
  offered_price_per_unit, requested_quantity, message, status, created_at
) VALUES (
  'inq-mtxyyflz', 'list-chilli-1', 'National Spices Hub', '9849012345', 'Spice Exporter',
  'Hyderabad', 18400, 20, 'Can pick up lot on Monday morning.',
  'PENDING', '2026-09-12 05:53:15'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO market_inquiries (
  id, listing_id, buyer_name, buyer_phone, buyer_type, buyer_location,
  offered_price_per_unit, requested_quantity, message, status, created_at
) VALUES (
  'inq-mtxz53ph', 'list-redgram-1', 'Ramesh Patil', '9822012345', 'Wholesale Trader / Commission Agent',
  'Local APMC Yard', 7650, 5, '',
  'PENDING', '2026-09-12 05:58:26'
) ON CONFLICT (id) DO NOTHING;

-- 7. Seed Reviews (28 rows)
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('r1', 'npk-191919', 'Ramesh Patil', 'Baramati, Maharashtra', 5, 'Used on my tomato and capsicum crop through drip. Within 5 days leaves turned vibrant dark green, flower drop stopped completely. Highly recommended!', 'Tomato & Capsicum', true, '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('r2', 'npk-191919', 'Balwinder Singh', 'Ludhiana, Punjab', 5, 'Genuine product delivered right to my farm gate within 24 hours. Soluble 100%, no sediment in Venturi system.', 'Wheat & Mustard', true, '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('r3', 'npk-191919', 'Venkatesh Rao', 'Guntur, Andhra Pradesh', 4, 'Very good quality fertilizer for chilli. Excellent root and stem thickness.', 'Red Chilli', true, '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('r4', 'neem-shield', 'Gajanan Deshmukh', 'Akola, Maharashtra', 5, 'Whitefly problem in cotton was severe. One spray of Neem Shield at 3ml/L cleared 80% infestation within 48 hours without chemicals.', 'Cotton', true, '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('r5', 'neem-shield', 'Mahesh Patel', 'Anand, Gujarat', 4, 'Good smell of pure neem oil, mixes easily in water without separation. Works great on aphids in okra.', 'Vegetables', true, '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('r6', 'enriched-compost', 'Suresh Kumar', 'Karnal, Haryana', 5, 'My soil was hard and crusting after years of DAP overdose. Applied this compost before paddy transplanting. Soil has become soft and crumbly!', 'Basmati Paddy', true, '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('r7', 'trichoderma-guard', 'Prashant More', 'Satara, Maharashtra', 5, 'Ginger rhizome rot was destroying my field every monsoon. Did seed rhizome treatment with Bio Guard this year. Zero rot and huge yield increase!', 'Ginger & Turmeric', true, '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('r8', 'yellow-sticky-traps', 'Kishore Reddy', 'Chittoor, Andhra Pradesh', 5, 'Best quality glue, even after heavy rains the glue is still very sticky. Trapped thousands of thrips in my capsicum shed.', 'Capsicum & Rose', true, '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('r9', 'mop-potash', 'Nitin Jadhav', 'Kolhapur, Maharashtra', 5, 'Applied to my sugarcane ratoon crop. Cane girth and height improved noticeably. Very good authentic potash.', 'Sugarcane', true, '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('r10', 'chelated-micronutrient', 'Harpreet Singh', 'Bathinda, Punjab', 5, 'Paddy showed yellow patches due to Zinc deficiency. Sprayed this chelate combo and within 3 days whole field turned emerald green.', 'Basmati Paddy', true, '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('ru1', 'urea-46', 'Ravi Shankar', 'Nandurbar, Maharashtra', 5, 'Good quality IFFCO urea at subsidized rate. Paddy crop showed excellent green response in 7 days.', 'HMT Paddy', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rd1', 'dap-1846', 'Kulwant Singh', 'Amritsar, Punjab', 5, 'Wheat crop root development is excellent this season with IFFCO DAP. Tillering count increased compared to last year.', 'PBW-343 Wheat', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('ri1', 'imidacloprid-17sl', 'Chandrakant Shinde', 'Nashik, Maharashtra', 5, 'BPH attack in paddy was severe. One spray at recommended dose completely controlled it. Excellent systemic action.', 'Paddy', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rc1', 'chlorpyrifos-20ec', 'Yogesh Bhange', 'Latur, Maharashtra', 5, 'Pod borer in tur was causing 40% damage. Sprayed 2ml/L at pod filling stage. Within 48 hrs, caterpillar population collapsed. Excellent result.', 'Red Gram / Tur', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('re1', 'emamectin-benzoate-5sg', 'Harish Bhatt', 'Nashik, Maharashtra', 5, 'DBM infestation was decimating my cabbage. Emamectin at 0.5g/L gave 95% control in 5 days. Even resistant strains were controlled. Superb product.', 'Cabbage & Cauliflower', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rl1', 'lambda-cyhalothrin-5ec', 'Manoj Yadav', 'Jalgaon, Maharashtra', 4, 'Quick knockdown on pod borers in tur. Within 1 hour of spray the caterpillars fell off the plants. Good product for rapid control.', 'Red Gram', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('ra1', 'acephate-75sp', 'Suresh Gaddam', 'Guntur, Andhra Pradesh', 5, 'Thrips in chilli flowers was the main problem. Acephate 2g/L with sticker completely solved it in 2 sprays. Flower drop stopped and chilli set improved dramatically.', 'Guntur Chilli (S4)', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rs1', 'spinosad-45sc', 'Priyanka Gaikwad', 'Jalgaon, Maharashtra', 5, 'Using Spinosad as rotation with Acephate for chilli thrips management. Excellent control. The 3-day PHI means I can spray even close to picking time safely.', 'Green Chilli', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rp1', 'profenofos-50ec', 'Dinesh Chaudhari', 'Amravati, Maharashtra', 4, 'Profenofos is our go-to for Helicoverpa in cotton. Effective at boll formation stage. Good product, real Syngenta quality.', 'Bt Cotton', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rm1', 'mancozeb-75wp', 'Raju Thorat', 'Nashik, Maharashtra', 5, 'Using Indofil M-45 every 8 days in tomato. Zero early blight in my field while neighbors lost 50% crop. True crop protector.', 'Tomato', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rcb1', 'carbendazim-50wp', 'Bhushan Jadhav', 'Kolhapur, Maharashtra', 4, 'Good for Sheath Blight control in paddy. 2 sprays at the right stage gave 70% control. Mixed with Mancozeb for better results.', 'Paddy', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rpr1', 'propiconazole-25ec', 'Ramesh Nair', 'Thrissur, Kerala', 5, 'Blast was destroying my paddy at heading stage. Emergency spray of Tilt at boot stage saved the entire crop. Neck break rate dropped from 35% to 3%. Excellent product.', 'Jyothi Paddy', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rrg1', 'metalaxyl-mancozeb', 'Sanjay Kumbhar', 'Satara, Maharashtra', 5, 'Saved my ginger crop from rhizome rot using Ridomil Gold drench. Applied at planting and again at 30 days. Near zero damping off this season.', 'Ginger', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rb1', 'beauveria-bassiana', 'Prashant Mane', 'Jalna, Maharashtra', 4, 'Using Beauveria as part of IPM for chilli thrips. Slower than chemicals but by week 2 the thrips population had completely crashed. Good organic tool.', 'Chilli', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rbt1', 'bacillus-thuringiensis', 'Vandana Kulkarni', 'Pune, Maharashtra', 5, 'Perfect for my organic vegetable farm. Spray Bt for DBM every 6 days. Zero caterpillar damage. No residue issue even for direct market sales.', 'Cabbage & Tomato', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rzs1', 'zinc-sulphate-33', 'Pramod Yadav', 'Varanasi, UP', 5, 'Khaira disease in paddy every year until I started soil application of Zinc Sulphate before transplanting. Problem completely solved. Yield up by 15%.', 'Paddy', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rcn1', 'calcium-nitrate-19', 'Santosh Bhosale', 'Nashik, Maharashtra', 5, 'BER was causing 30% tomato fruit loss. Started weekly CalciNit drip injection at fruit set stage. BER dropped to less than 2% in the next flush. Life-saving product.', 'Tomato', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified, created_at)
VALUES ('rbr1', 'borax-20', 'Mahesh Naik', 'Sangli, Maharashtra', 5, 'Hollow stem in cauliflower was my biggest problem. Applied borax at curd initiation stage. Near zero hollow stem this season. Simple and effective.', 'Cauliflower', true, '2026-09-12 06:17:58')
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Product Questions (3 rows)
INSERT INTO product_questions (id, product_id, question, asked_by, answer, answered_by, created_at)
VALUES ('q1', 'npk-191919', 'Can this 19:19:19 be mixed with systemic fungicide like Mancozeb or Carbendazim?', 'Santosh Gaikwad (Farmer, Sangli)', 'Yes, balanced NPK 19:19:19 is 100% compatible with non-alkaline fungicides. However, do NOT mix with copper fungicides or calcium nitrate.', 'Dr. P. K. Sharma (Senior Agronomist, FarmOS Advisory)', '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_questions (id, product_id, question, asked_by, answer, answered_by, created_at)
VALUES ('q2', 'npk-191919', 'How many kilograms should I give per acre through drip irrigation for Pomegranate?', 'Vikram Shinde (Farmer, Solapur)', 'For fruiting pomegranate trees, apply 4 kg to 5 kg per acre every 7 to 10 days during fruit enlargement stage.', 'Dr. P. K. Sharma (Senior Agronomist, FarmOS Advisory)', '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_questions (id, product_id, question, asked_by, answer, answered_by, created_at)
VALUES ('q3', 'neem-shield', 'Is this 10,000 PPM pure neem oil safe for flowering stage in Brinjal and Chilli?', 'Rajeshwar Patel (Farmer, Anand)', 'Yes, it is botanical and safe. Spray early morning (6-8 AM) or late evening (after 5 PM) when honey bees are not actively pollinating.', 'Dr. A. Verma (Agri Entomologist)', '2026-09-12 04:02:18')
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Notifications (5 rows)
INSERT INTO notifications (id, user_id, title, message, type, read, link, created_at)
VALUES ('notif-1', 'farmer-demo', 'Welcome to FarmOS!', 'Your smart farming companion is ready. Complete your soil profile to get personalized NPK dosage advice.', 'info', false, '/', '2026-09-12 05:29:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO notifications (id, user_id, title, message, type, read, link, created_at)
VALUES ('notif-2', 'farmer-demo', '250 Kisan Coins Credited', 'Welcome bonus credited! Use coins at checkout for instant ₹1/coin cash discount on certified fertilizers.', 'coin', false, '/store', '2026-09-12 05:29:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO notifications (id, user_id, title, message, type, read, link, created_at)
VALUES ('notif-3', 'farmer-demo', 'Kharif Advisory: Soil Moisture', 'Recent western Maharashtra rainfall shows favorable sowing window. Inspect your nitrogen application timing.', 'weather', false, '/', '2026-09-12 05:29:18')
ON CONFLICT (id) DO NOTHING;
INSERT INTO notifications (id, user_id, title, message, type, read, link, created_at)
VALUES ('notif-inq-mtxyyflz', 'farmer-venkat', 'New Buyer Offer for Dry Red Chilli (Guntur Teja S-17)!', 'National Spices Hub (Spice Exporter) made an offer of ₹18,400/Quintal (100 kg) for 20 Quintal (100 kg). Phone: 9849012345', 'order', false, '/marketplace/my-listings', '2026-09-12 05:53:15')
ON CONFLICT (id) DO NOTHING;
INSERT INTO notifications (id, user_id, title, message, type, read, link, created_at)
VALUES ('notif-inq-mtxz53pi', 'farmer-demo', 'New Buyer Offer for Red Gram / Pigeon Pea (Maruti Tur Dal)!', 'Ramesh Patil (Wholesale Trader / Commission Agent) made an offer of ₹7,650/Quintal (100 kg) for 5 Quintal (100 kg). Phone: 9822012345', 'order', false, '/marketplace/my-listings', '2026-09-12 05:58:26')
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Sample Orders (2 rows)
INSERT INTO orders (id, user_name, user_phone, address_json, delivery_speed, payment_method, subtotal, delivery_fee, discount, gst, coins_used, coins_earned, final_total, status, created_at)
VALUES ('FARM-677441', 'Test Farmer', '9822012345', '{"village":"Baramati"}'::jsonb, 'standard', 'cod', 1498, 0, 0, 75, 0, 78, 1573, 'CONFIRMED', '2026-09-12 04:02:24')
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, user_name, user_phone, address_json, delivery_speed, payment_method, subtotal, delivery_fee, discount, gst, coins_used, coins_earned, final_total, status, created_at)
VALUES ('FARM-555297', 'Ramesh Patil', '+91 98220 12345', '{"id":"addr-1","isDefault":true,"fullName":"Ramesh Patil","phone":"+91 98220 12345","addressType":"Farm Gate / Land","street":"Farm Plot No. 14, Gat 204, Near Canal Siphon","village":"Baramati Rural, Post Malegaon","district":"Pune","state":"Maharashtra","pincode":"413115","instructions":"Drive tractor road beside primary school. Call 30 mins before arrival."}'::jsonb, 'standard', 'cod', 2996, 0, 400, 150, 150, 137, 2746, 'CONFIRMED', '2026-09-12 04:09:10')
ON CONFLICT (id) DO NOTHING;

-- 11. Seed Order Items (2 rows)
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
VALUES ('FARM-677441', 'npk-191919', 'Balanced NPK 19:19:19 100% Water Soluble', 2, 749, 1498);
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
VALUES ('FARM-555297', 'npk-191919', 'Balanced NPK 19:19:19 100% Water Soluble', 4, 749, 2996);
