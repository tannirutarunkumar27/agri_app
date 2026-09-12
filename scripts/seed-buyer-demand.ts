import { getPool } from '../lib/db'

async function seedBuyerDemands() {
  console.log('🌾 Seeding Realistic Buyer Profiles and Active Demand Requests...')
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Seed buyer users
    await client.query(`
      INSERT INTO users (id, name, phone, password_hash, salt, role) VALUES
      ('usr-buyer-agro', 'Venkatesh Agro Industries', '9876500001', 'pbkdf2_demo_hash', 'demo_salt', 'buyer'),
      ('usr-buyer-spices', 'Guntur Spice Exporters', '9876500002', 'pbkdf2_demo_hash', 'demo_salt', 'buyer'),
      ('usr-buyer-grains', 'Modern Rice & Grain Traders', '9876500003', 'pbkdf2_demo_hash', 'demo_salt', 'buyer'),
      ('usr-buyer-spinning', 'Deccan Cotton Mills', '9876500004', 'pbkdf2_demo_hash', 'demo_salt', 'buyer')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, role = EXCLUDED.role;
    `)

    // 2. Seed buyer profiles
    await client.query(`
      INSERT INTO buyer_profiles (
        user_id, company_name, business_type, verification_level, gstin,
        purchasing_regions, completed_transactions, rating
      ) VALUES
      ('usr-buyer-agro', 'Venkatesh Agro Foods & Pulse Mill Pvt Ltd', 'Dal Mill & Pulse Processing Unit', 'BUSINESS_VERIFIED', '36AABCV1234F1Z5', '["Andhra Pradesh", "Telangana", "Karnataka", "Maharashtra"]'::jsonb, 24, 4.9),
      ('usr-buyer-spices', 'Guntur Red Spices & Oleoresin Exports', 'Spice Extraction & Export House', 'BUSINESS_VERIFIED', '37AABCG5678K1Z2', '["Andhra Pradesh", "Telangana", "Karnataka"]'::jsonb, 42, 4.8),
      ('usr-buyer-grains', 'Modern Grain Wholesalers & Sona Masuri Mill', 'Commercial Rice Mill & Mandi Merchant', 'VERIFIED', '29AABCM9012P1Z8', '["Karnataka", "Telangana", "Andhra Pradesh"]'::jsonb, 18, 4.7),
      ('usr-buyer-spinning', 'Deccan Cotton Spinners & Ginning Mills', 'Cotton Ginning & Spinning Mill', 'BUSINESS_VERIFIED', '36AABCD3456L1Z4', '["Telangana", "Maharashtra", "Gujarat"]'::jsonb, 31, 4.9)
      ON CONFLICT (user_id) DO UPDATE SET
        company_name = EXCLUDED.company_name,
        business_type = EXCLUDED.business_type,
        verification_level = EXCLUDED.verification_level,
        completed_transactions = EXCLUDED.completed_transactions,
        rating = EXCLUDED.rating;
    `)

    // 3. Seed active buyer demands
    await client.query(`
      INSERT INTO buyer_demand_requests (
        id, buyer_id, commodity_id, variety_id, grade_id,
        required_quantity, quantity_unit, minimum_quantity, filled_quantity,
        target_price_per_unit, maximum_price_per_unit,
        required_from_date, required_until_date,
        delivery_location, delivery_latitude, delivery_longitude, delivery_radius_km,
        delivery_preference, quality_requirements, notes, status, expires_at
      ) VALUES
      (
        'dem-redgram-001', 'usr-buyer-agro', 'comm-redgram', 'var-redgram-maruti', 'grade-faq',
        40.00, 'Quintal', 10.00, 0.00,
        7350.00, 7500.00,
        CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days',
        'Warangal Enamamula Market Yard, Telangana', 17.9689, 79.5941, 100,
        'FARM_GATE_PICKUP', 'FAQ Grade, clean sun-dried grains, moisture < 11%, zero weevils. Immediate digital weighbridge & escrow payment.',
        'Procuring for immediate dal mill batch processing. Direct tractor pickup available.', 'OPEN', CURRENT_TIMESTAMP + INTERVAL '20 days'
      ),
      (
        'dem-mirchi-001', 'usr-buyer-spices', 'comm-mirchi', 'var-mirchi-teja', 'grade-a',
        60.00, 'Quintal', 15.00, 10.00,
        19500.00, 20500.00,
        CURRENT_DATE, CURRENT_DATE + INTERVAL '25 days',
        'Guntur APMC Yard / Export Hub, Andhra Pradesh', 16.3067, 80.4365, 150,
        'EITHER', 'Teja S-17 Stemless, deep red color (ASTA 100+), moisture < 10.5%, zero foreign matter.',
        'Export order lot. High price for top quality deep red color.', 'OPEN', CURRENT_TIMESTAMP + INTERVAL '25 days'
      ),
      (
        'dem-rice-001', 'usr-buyer-grains', 'comm-rice', 'var-rice-sona', 'grade-a',
        100.00, 'Quintal', 25.00, 0.00,
        2950.00, 3100.00,
        CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
        'Raichur Grain Market, Karnataka', 16.2120, 77.3439, 120,
        'FARM_GATE_PICKUP', 'BPT 5204 Sona Masuri Paddy, uniform long slender grains, moisture < 13%.',
        'Regular fortnightly procurement for commercial milling.', 'OPEN', CURRENT_TIMESTAMP + INTERVAL '30 days'
      ),
      (
        'dem-cotton-001', 'usr-buyer-spinning', 'comm-cotton', 'var-cotton-bt', 'grade-faq',
        80.00, 'Quintal', 20.00, 0.00,
        7200.00, 7450.00,
        CURRENT_DATE, CURRENT_DATE + INTERVAL '35 days',
        'Khammam Mandi Yard, Telangana', 17.2473, 80.1514, 100,
        'DELIVERY_TO_WAREHOUSE', 'Medium-long staple length, clean white bolls, zero trash/leaf contamination.',
        'Prompt payment within 24 hours of moisture testing.', 'OPEN', CURRENT_TIMESTAMP + INTERVAL '35 days'
      )
      ON CONFLICT (id) DO UPDATE SET
        target_price_per_unit = EXCLUDED.target_price_per_unit,
        maximum_price_per_unit = EXCLUDED.maximum_price_per_unit,
        required_quantity = EXCLUDED.required_quantity,
        status = EXCLUDED.status,
        expires_at = EXCLUDED.expires_at;
    `)

    await client.query('COMMIT')
    console.log('✅ Seeded 4 buyer profiles and 4 active demand requests in single transaction!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seeding buyer demands failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seedBuyerDemands()
