export type ProductReview = {
  id: string
  farmerName: string
  location: string
  rating: number
  date: string
  comment: string
  cropGrown: string
  verified: boolean
}

export type UsageStep = {
  step: number
  title: string
  detail: string
}

export type UsageGuide = {
  bestTime: string
  pestsTargeted: string[]
  preparationSteps: UsageStep[]
  warningNote: string
  phiDays: number // pre-harvest interval days
  reentryHours: number
}

export type Product = {
  id: string
  name: string
  brand: string
  type: string
  category: 'Fertilizer' | 'Natural protection' | 'Soil amendment' | 'Biological soil care' | 'Monitoring tool' | 'Micronutrient' | 'Insecticide' | 'Fungicide' | 'Herbicide' | 'Bio-pesticide'
  crop: string
  price: number
  originalPrice: number
  unit: string
  badge: string
  tone: string
  rating: number
  reviewCount: number
  inStock: boolean
  stockCount: number
  deliveryDays: string
  seller: string
  composition: string
  npkRatio?: string
  dosagePerAcre: string
  applicationMethod: string
  suitableCrops: string[]
  description: string
  features: string[]
  safetyAdvice: string
  imageUrl?: string
  usageGuide?: UsageGuide
  reviews: ProductReview[]
}

export const PRODUCTS: Product[] = [
  // ─── FERTILIZERS ──────────────────────────────────────────────────────────
  {
    id: 'npk-191919',
    name: 'Balanced NPK 19:19:19 100% Water Soluble',
    brand: 'Kisan Shakti Agri',
    type: 'Water soluble fertilizer',
    category: 'Fertilizer',
    crop: 'Vegetables, Paddy, Wheat & Fruit crops',
    price: 749,
    originalPrice: 999,
    unit: '5 kg',
    badge: 'Amazon Choice · Bestseller',
    tone: 'bg-sky-100 text-sky-800 border-sky-300',
    rating: 4.8,
    reviewCount: 1420,
    inStock: true,
    stockCount: 14,
    deliveryDays: 'Tomorrow by 2 PM',
    seller: 'Kisan Krishi Kendra (Govt Authorized)',
    composition: 'Nitrogen 19%, Phosphorus 19%, Potassium 19% + Chelate Micronutrients',
    npkRatio: '19:19:19',
    dosagePerAcre: '4 - 5 kg per acre via drip irrigation or 10g/L foliar spray',
    applicationMethod: 'Drip irrigation / Foliar spray at active vegetative & flowering stage',
    suitableCrops: ['Tomatoes', 'Paddy', 'Wheat', 'Chilli', 'Cotton', 'Sugarcane', 'Pomegranate', 'Red Gram', 'Green Gram'],
    description: 'High-purity, fully water-soluble balanced NPK fertilizer enriched with essential chelated trace elements. Boosts vegetative growth, promotes lush canopy, root vigor, and increases fruit setting and grain weight significantly.',
    features: [
      '100% instant solubility without nozzle clogging',
      'Balanced N:P:K ratio perfect for all vegetative and flowering stages',
      'Enriched with EDTA chelated trace minerals (Fe, Zn, Mn, Cu, B, Mo)',
      'Compatible with most non-alkaline bio-stimulants and micronutrient sprays',
      'Govt Certified FCO compliant with batch test QR code'
    ],
    safetyAdvice: 'Store in dry moisture-proof bag. Avoid mixing with calcium fertilizers or copper hydroxide sprays.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/NPK_fertilizer.jpg/640px-NPK_fertilizer.jpg',
    usageGuide: {
      bestTime: 'Early morning (6–9 AM) or evening (after 4 PM) to avoid spray drift and UV degradation',
      pestsTargeted: ['Nitrogen deficiency', 'Phosphorus deficiency', 'Potassium deficiency', 'Vegetative stunting', 'Poor fruit setting'],
      preparationSteps: [
        { step: 1, title: 'Check Water Quality', detail: 'Use clean water with pH 5.5–7.0. Hard water (>800 ppm) can reduce solubility. Add citric acid 0.5g/L to acidify if needed.' },
        { step: 2, title: 'Measure Accurately', detail: 'Use weighing scale: 10g per litre for foliar spray, or 4–5 kg per acre for drip. Pre-dissolve in a small bucket of water before adding to tank.' },
        { step: 3, title: 'Fill & Mix', detail: 'Fill spray tank ¾ with water, add dissolved NPK concentrate, stir well, then top up to full volume. Never pour powder directly into full tank.' },
        { step: 4, title: 'Apply Uniformly', detail: 'For foliar: spray under leaf surface for maximum absorption. For drip: inject during active irrigation cycle at crop root zone.' },
        { step: 5, title: 'Tank Flush', detail: 'Flush spray tank with clean water after use. Record date, dose, and crop stage in spray log book.' }
      ],
      warningNote: 'Do NOT mix with calcium nitrate or copper-based fungicides in the same spray tank — precipitate forms and blocks nozzles.',
      phiDays: 0,
      reentryHours: 1
    },
    reviews: [
      { id: 'r1', farmerName: 'Ramesh Patil', location: 'Baramati, Maharashtra', rating: 5, date: '2 days ago', comment: 'Used on my tomato and capsicum crop through drip. Within 5 days leaves turned vibrant dark green, flower drop stopped completely. Highly recommended!', cropGrown: 'Tomato & Capsicum', verified: true },
      { id: 'r2', farmerName: 'Balwinder Singh', location: 'Ludhiana, Punjab', rating: 5, date: '1 week ago', comment: 'Genuine product delivered right to my farm gate within 24 hours. Soluble 100%, no sediment in Venturi system.', cropGrown: 'Wheat & Mustard', verified: true },
      { id: 'r3', farmerName: 'Venkatesh Rao', location: 'Guntur, Andhra Pradesh', rating: 4, date: '3 weeks ago', comment: 'Very good quality fertilizer for chilli. Excellent root and stem thickness.', cropGrown: 'Red Chilli', verified: true }
    ]
  },
  {
    id: 'urea-46',
    name: 'Urea 46% N Prilled (FCO Grade)',
    brand: 'IFFCO / Rashtriya Chemicals',
    type: 'Nitrogen fertilizer',
    category: 'Fertilizer',
    crop: 'Paddy, Wheat, Maize, Sugarcane, Vegetables',
    price: 499,
    originalPrice: 599,
    unit: '25 kg',
    badge: 'Govt Subsidized MRP',
    tone: 'bg-sky-100 text-sky-800 border-sky-300',
    rating: 4.7,
    reviewCount: 3200,
    inStock: true,
    stockCount: 80,
    deliveryDays: 'Delivery in 2 Days',
    seller: 'Kisan Krishi Kendra (Govt Authorized)',
    composition: 'Nitrogen (as Urea) 46% minimum, prilled granular form',
    npkRatio: '46:0:0',
    dosagePerAcre: '25–50 kg per acre in 2–3 split doses',
    applicationMethod: 'Soil broadcasting and incorporation before irrigation; avoid foliar at flowering',
    suitableCrops: ['Paddy', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Red Gram', 'Green Gram', 'Vegetables'],
    description: 'India\'s most widely used nitrogen fertilizer. Prilled urea dissolves rapidly in soil moisture, releasing ammonical nitrogen that boosts vegetative growth, leaf area, and tiller count in cereals.',
    features: [
      'Highest nitrogen content (46%) among solid N fertilizers',
      'IFFCO prilled — uniform 2–4 mm granule size for broadcast spreader',
      'FCO Grade A certified with batch number and QR code',
      'Essential for first topdressing in paddy after transplanting',
      'Split application reduces losses — use 2–3 doses for best results'
    ],
    safetyAdvice: 'Avoid applying just before heavy rain or irrigation — volatilization losses increase. Do not apply when soil is waterlogged.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Urea_ball.jpg/640px-Urea_ball.jpg',
    usageGuide: {
      bestTime: 'Apply in early morning when soil is moist but not saturated. Avoid hot afternoon applications.',
      pestsTargeted: ['Nitrogen deficiency', 'Yellowing leaves', 'Poor tiller formation', 'Stunted vegetative growth'],
      preparationSteps: [
        { step: 1, title: 'Calculate Dose', detail: 'Soil test recommended. General: 25 kg/acre basal + 15 kg/acre at tillering + 10 kg/acre at panicle initiation for paddy.' },
        { step: 2, title: 'Broadcast Evenly', detail: 'Use manual broadcast spreader or walk-behind rotary spreader. Do not hand broadcast as it causes uneven distribution.' },
        { step: 3, title: 'Incorporate Immediately', detail: 'Lightly irrigate or incorporate into soil within 24 hours to prevent ammonia volatilization losses (up to 30% if left on surface).' },
        { step: 4, title: 'Split Applications', detail: 'Never apply full dose at once. Split in 2–3 applications: basal at transplanting, topdress at 25 DAS, and optional third at heading.' },
        { step: 5, title: 'Monitor Response', detail: 'Check leaf color 7–10 days post application. If leaves remain pale, consider foliar spray with dilute urea (1–2% solution).' }
      ],
      warningNote: 'Excess urea causes soil acidification over time and promotes pest buildup. Always combine with phosphatic and potassic fertilizers.',
      phiDays: 0,
      reentryHours: 0
    },
    reviews: [
      { id: 'ru1', farmerName: 'Ravi Shankar', location: 'Nandurbar, Maharashtra', rating: 5, date: '1 week ago', comment: 'Good quality IFFCO urea at subsidized rate. Paddy crop showed excellent green response in 7 days.', cropGrown: 'HMT Paddy', verified: true }
    ]
  },
  {
    id: 'dap-1846',
    name: 'DAP 18:46:0 Di-Ammonium Phosphate',
    brand: 'IFFCO DAP',
    type: 'Phosphatic fertilizer',
    category: 'Fertilizer',
    crop: 'Wheat, Paddy, Pulses, Oilseeds, Vegetables',
    price: 1399,
    originalPrice: 1599,
    unit: '50 kg',
    badge: 'Most Used Basal Fertilizer',
    tone: 'bg-slate-100 text-slate-800 border-slate-300',
    rating: 4.9,
    reviewCount: 5100,
    inStock: true,
    stockCount: 60,
    deliveryDays: 'Delivery in 2 Days (Heavy)',
    seller: 'Kisan Krishi Kendra (Govt Authorized)',
    composition: 'Nitrogen 18%, Phosphorus (P2O5) 46% — granular form',
    npkRatio: '18:46:0',
    dosagePerAcre: '40–60 kg per acre as basal (at sowing/transplanting)',
    applicationMethod: 'Basal application in seed furrows at sowing time; avoid direct seed contact',
    suitableCrops: ['Wheat', 'Paddy', 'Red Gram', 'Green Gram', 'Chickpea', 'Soybean', 'Groundnut', 'Mustard', 'Tomato', 'Onion'],
    description: 'India\'s most popular basal fertilizer providing both nitrogen and high phosphorus for root development, early establishment, and flowering. Essential for pulse crops and oilseeds.',
    features: [
      '46% phosphorus — highest P content in any granular fertilizer',
      'Promotes strong root system development and nodule formation in pulses',
      'IFFCO granular form — uniform distribution, low dust',
      'Ideal for Rabi crops like wheat, gram, and mustard as basal dose',
      'Water-soluble phosphate ions immediately available to young roots'
    ],
    safetyAdvice: 'Place in seed furrow 2–3 cm away from seeds. Direct contact with seed causes germination damage.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Diammonium_phosphate.jpg/640px-Diammonium_phosphate.jpg',
    usageGuide: {
      bestTime: 'Apply at sowing time as basal. Incorporate with last ploughing or seed furrow placement.',
      pestsTargeted: ['Phosphorus deficiency', 'Poor root development', 'Slow germination', 'Weak nodulation in pulses'],
      preparationSteps: [
        { step: 1, title: 'Soil Test First', detail: 'Phosphorus responsive soils: apply 50–60 kg/acre. Medium P soils: 35–40 kg/acre. Sandy soils: apply in 2 splits to prevent leaching.' },
        { step: 2, title: 'Mix with Soil', detail: 'Broadcast uniformly and incorporate during last ploughing. Alternatively, apply in seed furrow placement (band placement is 20–30% more efficient).' },
        { step: 3, title: 'Band Placement', detail: 'For maximum efficiency in dryland: use seed drill with fertilizer attachment to place DAP 5–6 cm deep and 5 cm to the side of seed row.' },
        { step: 4, title: 'Water Immediately', detail: 'Irrigate gently after application to help phosphate movement into root zone. Avoid waterlogging which fixes phosphorus.' },
        { step: 5, title: 'Combine with Urea', detail: 'DAP provides starter N but use additional urea for later-stage nitrogen needs. Plan total fertilizer program per crop requirement.' }
      ],
      warningNote: 'Never apply DAP foliar spray — high P concentration causes leaf burn. Soil application only.',
      phiDays: 0,
      reentryHours: 0
    },
    reviews: [
      { id: 'rd1', farmerName: 'Kulwant Singh', location: 'Amritsar, Punjab', rating: 5, date: '3 days ago', comment: 'Wheat crop root development is excellent this season with IFFCO DAP. Tillering count increased compared to last year.', cropGrown: 'PBW-343 Wheat', verified: true }
    ]
  },
  {
    id: 'neem-shield',
    name: 'Neem Shield Botanical 10,000 PPM Bio-Pesticide',
    brand: 'GreenBio Protect',
    type: 'Natural protection',
    category: 'Natural protection',
    crop: 'Cotton, Vegetables, Pulses, Fruit trees',
    price: 389,
    originalPrice: 520,
    unit: '1 L',
    badge: '100% Organic Certified',
    tone: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    rating: 4.7,
    reviewCount: 940,
    inStock: true,
    stockCount: 28,
    deliveryDays: 'Delivery in 2 Days',
    seller: 'AgriCare Organic Hub',
    composition: 'Cold pressed Pure Azadirachtin 10,000 PPM (1.0% w/w EC) + natural emulsifiers',
    dosagePerAcre: '2.5 ml to 3 ml per Litre of water (400-500 ml per acre)',
    applicationMethod: 'Foliar spray during early morning or late evening',
    suitableCrops: ['Cotton', 'Brinjal', 'Okra', 'Cabbage', 'Soybean', 'Mango', 'Red Gram', 'Green Gram', 'Tomato', 'Chilli'],
    description: 'Broad-spectrum organic antifeedant, insect repellent, and oviposition deterrent. Controls whiteflies, aphids, jassids, thrips, caterpillars, and leaf miners without harming beneficial bees or earthworms.',
    features: [
      'Certified organic by Jaivik Bharat and NPOP',
      'Zero synthetic chemical residue, ideal for export quality crops',
      'Prevents pest immunity and egg hatching cycle',
      'Safe for honey bees, ladybird beetles, and soil microbiome',
      'Extended UV-stable residual repellent effect on leaf surfaces'
    ],
    safetyAdvice: 'Spray during cool hours (6-9 AM or after 5 PM). Wear eye protection during mixing.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Neem_oil.jpg/640px-Neem_oil.jpg',
    usageGuide: {
      bestTime: 'Early morning (6–9 AM) or evening (after 5 PM) — UV degrades Azadirachtin rapidly in midday sun',
      pestsTargeted: ['Whiteflies', 'Aphids', 'Jassids', 'Leaf miners', 'Thrips', 'Mealybugs', 'Spider mites', 'Caterpillars', 'Beetles'],
      preparationSteps: [
        { step: 1, title: 'Shake Bottle Well', detail: 'Neem EC separates on storage. Shake vigorously for 30 seconds before measuring dose. Use 2.5–3 ml per litre of water.' },
        { step: 2, title: 'Prepare Emulsion', detail: 'Add neem dose to small cup of water with 1–2 drops of liquid soap (as emulsifier). Mix until milky white emulsion forms.' },
        { step: 3, title: 'Add to Spray Tank', detail: 'Fill tank ¾ with clean water, add neem emulsion, stir well. Spray within 8 hours — neem degrades in dilute state.' },
        { step: 4, title: 'Thorough Coverage', detail: 'Spray upper AND lower leaf surfaces — most pests (whitefly, aphids) feed on underside of leaves. Use fine mist nozzle.' },
        { step: 5, title: 'Repeat Schedule', detail: 'For active infestations: spray every 7–10 days for 3 sprays. As preventive: spray every 14–21 days. Rotate with other bio-pesticides.' }
      ],
      warningNote: 'Do not mix with copper-based or sulfur fungicides. Application in strong sunlight drastically reduces efficacy — spray in cool hours only.',
      phiDays: 1,
      reentryHours: 4
    },
    reviews: [
      { id: 'r4', farmerName: 'Gajanan Deshmukh', location: 'Akola, Maharashtra', rating: 5, date: '4 days ago', comment: 'Whitefly problem in cotton was severe. One spray of Neem Shield at 3ml/L cleared 80% infestation within 48 hours without chemicals.', cropGrown: 'Cotton', verified: true },
      { id: 'r5', farmerName: 'Mahesh Patel', location: 'Anand, Gujarat', rating: 4, date: '2 weeks ago', comment: 'Good smell of pure neem oil, mixes easily in water without separation. Works great on aphids in okra.', cropGrown: 'Vegetables', verified: true }
    ]
  },
  {
    id: 'enriched-compost',
    name: 'Enriched Farm Compost & Microbial Humus',
    brand: 'Dharti Ratna Organics',
    type: 'Soil amendment',
    category: 'Soil amendment',
    crop: 'All Field, Fruit & Plantation Crops',
    price: 499,
    originalPrice: 650,
    unit: '25 kg',
    badge: 'Soil Health Card Approved',
    tone: 'bg-amber-100 text-amber-900 border-amber-300',
    rating: 4.9,
    reviewCount: 810,
    inStock: true,
    stockCount: 45,
    deliveryDays: 'Delivery in 3 Days (Heavy Vehicle)',
    seller: 'Dharti Agri Cooperative',
    composition: 'Aerobically composted farm biomass, enriched with Humic Acid 6%, Fulvic Acid, beneficial Trichoderma & mycorrhiza',
    dosagePerAcre: '100 - 200 kg per acre during field preparation or around root basin',
    applicationMethod: 'Soil broadcasting before sowing or side dressing along crop rows',
    suitableCrops: ['All Field Crops', 'Horticulture', 'Orchards', 'Floriculture'],
    description: 'Fully aged, odorless microbial compost rich in organic carbon and humus. Rejuvenates depleted soils, boosts water retention in sandy soils, improves aeration in heavy black soils, and activates native earthworms.',
    features: [
      'Increases soil organic carbon (SOC) levels from depleted 0.3% to healthy >0.8%',
      'Improves water holding capacity by up to 35%, cutting irrigation frequency',
      'Rich in slow-release micro and macro nutrients',
      'Completely weed-seed free and pathogen-free (pasteurized composting)',
      'Bulk farmer package with moisture-lock inner liner'
    ],
    safetyAdvice: 'Incorporate into top 4-6 inches of soil and irrigate lightly for rapid microbial colonization.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Compost_in_hand.jpg/640px-Compost_in_hand.jpg',
    usageGuide: {
      bestTime: 'Apply 2–3 weeks before sowing or transplanting to allow microbial activation',
      pestsTargeted: ['Soil compaction', 'Low organic matter', 'Poor water retention', 'Soil-borne disease susceptibility'],
      preparationSteps: [
        { step: 1, title: 'Soil Test', detail: 'Check baseline organic carbon (OC%) and pH. Target OC >0.5% and pH 6.0–7.5 for best compost response.' },
        { step: 2, title: 'Apply to Field', detail: 'Broadcast 100–200 kg per acre uniformly before ploughing. For orchards: apply 5–10 kg per tree in ring basin.' },
        { step: 3, title: 'Incorporate Deeply', detail: 'Plough or rotavate to mix compost into top 15–20 cm of soil. Surface application reduces benefit.' },
        { step: 4, title: 'Irrigate Lightly', detail: 'Apply light irrigation within 24 hours to activate soil microbes in compost. Keep soil moist but not waterlogged.' },
        { step: 5, title: 'Repeat Annually', detail: 'Apply every kharif or rabi season to build long-term soil health. Combine with green manure crops like dhaincha.' }
      ],
      warningNote: 'Ensure compost is fully matured (C:N ratio <20:1) before use. Immature compost causes nitrogen immobilization and can harm germination.',
      phiDays: 0,
      reentryHours: 0
    },
    reviews: [
      { id: 'r6', farmerName: 'Suresh Kumar', location: 'Karnal, Haryana', rating: 5, date: '5 days ago', comment: 'My soil was hard and crusting after years of DAP overdose. Applied this compost before paddy transplanting. Soil has become soft and crumbly!', cropGrown: 'Basmati Paddy', verified: true }
    ]
  },
  {
    id: 'trichoderma-guard',
    name: 'Trichoderma Bio Guard 2x10^8 CFU/g Fungicide',
    brand: 'BioShield Agro',
    type: 'Biological soil care',
    category: 'Biological soil care',
    crop: 'Roots, Seedlings, Pulses, Ginger, Turmeric',
    price: 299,
    originalPrice: 399,
    unit: '1 kg',
    badge: 'Biological Root Shield',
    tone: 'bg-lime-100 text-lime-900 border-lime-300',
    rating: 4.8,
    reviewCount: 650,
    inStock: true,
    stockCount: 30,
    deliveryDays: 'Tomorrow by 4 PM',
    seller: 'AgriBio Science Lab',
    composition: 'Trichoderma viride viable spores (2 x 10^8 CFU/g min) on carrier talc base',
    dosagePerAcre: 'Seed treatment: 10g/kg seed; Soil application: 2-3 kg/acre mixed in 100kg compost',
    applicationMethod: 'Seed dressing, seedling root dip, or drenching around root zones',
    suitableCrops: ['Ginger', 'Turmeric', 'Chickpea', 'Tomato', 'Banana', 'Chilli', 'Groundnut', 'Red Gram'],
    description: 'Potent biological antagonist and plant growth promoting fungus. Attacks, parasitizes, and destroys soil-borne fungal pathogens causing root rot, collar rot, damping-off, and Fusarium wilt.',
    features: [
      'High spore viability CFU count tested in university agri labs',
      'Controls Fusarium, Pythium, Rhizoctonia, and Sclerotium rot',
      'Produces natural plant growth hormones stimulating deep root hair growth',
      'Compatible with FYM, compost, and bio-fertilizers',
      'Safe for organic and conventional regenerative farming'
    ],
    safetyAdvice: 'Do not mix with chemical systemic fungicides (Carbendazim/Mancozeb) within 7 days.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Trichoderma_reesei_on_PDA_plate.jpg/640px-Trichoderma_reesei_on_PDA_plate.jpg',
    usageGuide: {
      bestTime: 'Apply at sowing/transplanting time. Evening soil application is preferred — avoid hot dry conditions.',
      pestsTargeted: ['Root rot (Fusarium)', 'Collar rot (Sclerotium)', 'Damping off (Pythium)', 'Rhizoctonia blight', 'Wilt diseases'],
      preparationSteps: [
        { step: 1, title: 'Seed Treatment', detail: 'Mix 10g Trichoderma per kg seed with a small amount of water or jaggery solution. Coat seeds and shade dry for 30 minutes before sowing.' },
        { step: 2, title: 'Soil Application', detail: 'Mix 2–3 kg Trichoderma in 100 kg well-decomposed FYM or compost. Broadcast in field and incorporate 7–10 days before sowing.' },
        { step: 3, title: 'Seedling Root Dip', detail: 'Prepare slurry of 50g Trichoderma in 1 litre water. Dip seedling roots for 20–30 minutes before transplanting.' },
        { step: 4, title: 'Root Zone Drench', detail: 'Dissolve 100g in 10 litre water and drench 250 ml per plant at root zone monthly during active growth.' },
        { step: 5, title: 'Avoid Chemical Fungicides', detail: 'Wait 7 days after any chemical fungicide spray before applying Trichoderma. Chemical fungicides kill beneficial organisms.' }
      ],
      warningNote: 'Store in cool, dry place (<25°C). Exposure to direct sunlight destroys spore viability. Check manufacturing date — use within 18 months.',
      phiDays: 0,
      reentryHours: 0
    },
    reviews: [
      { id: 'r7', farmerName: 'Prashant More', location: 'Satara, Maharashtra', rating: 5, date: '1 week ago', comment: 'Ginger rhizome rot was destroying my field every monsoon. Did seed rhizome treatment with Bio Guard this year. Zero rot and huge yield increase!', cropGrown: 'Ginger & Turmeric', verified: true }
    ]
  },
  {
    id: 'yellow-sticky-traps',
    name: 'Yellow & Blue Sticky Trap Pest Monitoring Kit',
    brand: 'AgriTrap Pro',
    type: 'Monitoring tool',
    category: 'Monitoring tool',
    crop: 'Protected crops, Polyhouses, Open fields',
    price: 219,
    originalPrice: 320,
    unit: '20 traps (15 Yellow + 5 Blue)',
    badge: 'Pest IPM Essential',
    tone: 'bg-violet-100 text-violet-800 border-violet-300',
    rating: 4.6,
    reviewCount: 430,
    inStock: true,
    stockCount: 50,
    deliveryDays: 'Tomorrow by 11 AM',
    seller: 'Kisan Tool Mart',
    composition: 'UV-resistant recyclable polymer sheet coated with non-drying insect adhesive glue on both sides',
    dosagePerAcre: '15 - 20 traps per acre placed at crop canopy height',
    applicationMethod: 'Hang using supplied galvanized wire ties just above crop canopy',
    suitableCrops: ['Polyhouse vegetables', 'Open field crops', 'Orchards', 'Nurseries', 'Tomato', 'Capsicum', 'Chilli', 'Cucumber'],
    description: 'Dual-action insect monitoring and mass trapping kit. Bright spectral yellow traps catch whiteflies, aphids, fungus gnats, and leaf miners, while blue traps specifically attract and trap destructive thrips.',
    features: [
      'Weather-proof, non-melting adhesive lasts up to 60 days in direct sun and rain',
      'Pre-punched holes with 20 metallic hanging wires included in box',
      'Monitors pest arrival early before visual crop damage occurs',
      'Reduces need for costly chemical pesticide sprays by up to 50%',
      'Double sided high-stick surface with easy peel protective liners'
    ],
    safetyAdvice: 'Place traps 15-20 cm above growing plant tips. Replace when 70% covered with pests.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Yellow_sticky_trap_in_tomato.jpg/640px-Yellow_sticky_trap_in_tomato.jpg',
    usageGuide: {
      bestTime: 'Install traps at crop emergence — early monitoring is key to IPM-based pest management',
      pestsTargeted: ['Whiteflies (yellow trap)', 'Aphids (yellow trap)', 'Fungus gnats (yellow trap)', 'Leaf miners (yellow trap)', 'Thrips (blue trap)', 'Fruit flies (yellow trap)'],
      preparationSteps: [
        { step: 1, title: 'Peel Protective Film', detail: 'Peel the silicone release liner from both sides of the trap just before deployment. Do not touch the sticky surface.' },
        { step: 2, title: 'Attach Hanging Wire', detail: 'Thread provided galvanized wire through pre-punched top hole. Bend wire into hook to hang on bamboo stick or wire support above crop.' },
        { step: 3, title: 'Position Correctly', detail: 'Hang so bottom of trap is 10–15 cm ABOVE crop canopy top. Too low = not attractive; too high = reduced catch. Adjust weekly as crop grows.' },
        { step: 4, title: 'Space Uniformly', detail: 'Place 1 trap per 5 metres in row crops (2×2.5 m grid = 20 traps/acre). In polyhouses: 1 trap per 25 sqm area near vents.' },
        { step: 5, title: 'Monitor Weekly', detail: 'Check traps every 7 days. Count pest numbers (helps track population trend). Replace trap when 60–70% surface is covered.' }
      ],
      warningNote: 'Yellow traps also catch beneficial insects like parasitic wasps and lacewings. In IPM programs, count good vs. bad insects before deciding on pesticide use.',
      phiDays: 0,
      reentryHours: 0
    },
    reviews: [
      { id: 'r8', farmerName: 'Kishore Reddy', location: 'Chittoor, Andhra Pradesh', rating: 5, date: '2 weeks ago', comment: 'Best quality glue, even after heavy rains the glue is still very sticky. Trapped thousands of thrips in my capsicum shed.', cropGrown: 'Capsicum & Rose', verified: true }
    ]
  },
  {
    id: 'mop-potash',
    name: 'Muriate of Potash (MOP) 60% K2O Fertilizer',
    brand: 'Bharat Potash Corp',
    type: 'Potassium fertilizer',
    category: 'Fertilizer',
    crop: 'Sugarcane, Banana, Potato, Paddy, Fruits',
    price: 579,
    originalPrice: 750,
    unit: '10 kg',
    badge: 'High Potash 60%',
    tone: 'bg-slate-100 text-slate-800 border-slate-300',
    rating: 4.7,
    reviewCount: 520,
    inStock: true,
    stockCount: 22,
    deliveryDays: 'Delivery in 2 Days',
    seller: 'Bharat Agri Inputs Ltd',
    composition: 'Potassium Chloride (Potash as K2O min 60.0%) crystalline granular form',
    npkRatio: '0:0:60',
    dosagePerAcre: '25 - 40 kg per acre in 2 split applications during tuber/fruit sizing',
    applicationMethod: 'Soil broadcasting followed by immediate irrigation',
    suitableCrops: ['Sugarcane', 'Banana', 'Potato', 'Cotton', 'Maize', 'Paddy', 'Onion', 'Tomato'],
    description: 'High-grade potassium fertilizer essential for carbohydrate synthesis, water regulation in drought stress, disease resistance, and enhancement of fruit size, shine, sweetness (Brix value), and grain firmness.',
    features: [
      'Standard FCO Grade 60% water soluble potash',
      'Promotes uniform tuber sizing in potato and bulb firmness in onion',
      'Strengthens crop stalks against lodging in windy monsoon conditions',
      'Enhances pest and fungal resistance by thickening plant cell walls',
      'Tested for low moisture and zero caking'
    ],
    safetyAdvice: 'Avoid direct contact with seeds during sowing. Irrigate immediately after soil application.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Potassium_chloride.jpg/640px-Potassium_chloride.jpg',
    usageGuide: {
      bestTime: 'Apply in splits: first at transplanting/sowing and second at fruit/tuber development stage',
      pestsTargeted: ['Potassium deficiency', 'Poor fruit quality', 'Drought stress', 'Weak stalks and lodging', 'Low brix/sweetness'],
      preparationSteps: [
        { step: 1, title: 'Plan Split Doses', detail: 'First application: 50% of recommended dose at basal. Second application: remaining 50% at tuber/fruit initiation stage.' },
        { step: 2, title: 'Broadcast Evenly', detail: 'Spread uniformly between crop rows using a broadcast spreader. Avoid direct contact with plant stems.' },
        { step: 3, title: 'Irrigate Immediately', detail: 'Apply irrigation within 12–24 hours of application. Potash dissolves and moves into root zone with water.' },
        { step: 4, title: 'Avoid Salt-Sensitive Crops', detail: 'Chloride-sensitive crops like tobacco and some fruits: use SOP (Sulfate of Potash) instead of MOP.' },
        { step: 5, title: 'Soil Test Check', detail: 'If soil K is already high (>200 kg/ha), reduce dose by 30–40%. Excess K causes magnesium deficiency in some crops.' }
      ],
      warningNote: 'Chloride in MOP may affect salt-sensitive crops at high doses. For chloride-sensitive crops like tobacco, grapes, and some specialty vegetables, prefer SOP.',
      phiDays: 0,
      reentryHours: 0
    },
    reviews: [
      { id: 'r9', farmerName: 'Nitin Jadhav', location: 'Kolhapur, Maharashtra', rating: 5, date: '3 weeks ago', comment: 'Applied to my sugarcane ratoon crop. Cane girth and height improved noticeably. Very good authentic potash.', cropGrown: 'Sugarcane', verified: true }
    ]
  },
  {
    id: 'chelated-micronutrient',
    name: 'Multi-Micronutrient Chelate Combo (Zn, Fe, B, Mn)',
    brand: 'Kisan Ratna Micronutrients',
    type: 'Micronutrient fertilizer',
    category: 'Micronutrient',
    crop: 'Citrus, Paddy, Cotton, Vegetables, Pulses',
    price: 349,
    originalPrice: 480,
    unit: '500 g',
    badge: 'Instant Leaf Greening',
    tone: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    rating: 4.9,
    reviewCount: 390,
    inStock: true,
    stockCount: 19,
    deliveryDays: 'Tomorrow by 1 PM',
    seller: 'Kisan Krishi Kendra (Govt Authorized)',
    composition: 'EDTA Zinc 5%, EDTA Iron 4%, Boron 2%, Manganese 2%, Copper 0.5%, Molybdenum 0.05%',
    dosagePerAcre: '1 to 1.5 g per Litre of water (200-250 g per acre spray)',
    applicationMethod: 'Foliar spray during active flush and pre-flowering stage',
    suitableCrops: ['Paddy (Khaira disease)', 'Citrus (Yellowing)', 'Cotton (Red leaf disease)', 'Vegetables', 'Chilli', 'Green Gram'],
    description: 'Fully chelated multi-micronutrient formula specifically designed to correct chlorosis, yellowing, leaf bronzing, and micro-deficiencies. 100% bio-available to plants within 48 hours of foliar spray.',
    features: [
      'EDTA chelation prevents nutrients from getting locked in high pH alkaline soils',
      'Rapidly reverses leaf yellowing and stunted shoot growth',
      'Boosts chlorophyll synthesis and photosynthesis rate',
      'Compatible with commonly used water-soluble NPK sprays',
      'Dissolves clear instantly in cold spray water'
    ],
    safetyAdvice: 'Do not spray in harsh midday sun. Best sprayed early morning.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Chelated_micronutrient_fertilizer.jpg/640px-Chelated_micronutrient_fertilizer.jpg',
    usageGuide: {
      bestTime: 'Spray at first sign of deficiency symptoms or as preventive at 30–45 DAS',
      pestsTargeted: ['Zinc deficiency (Khaira in paddy)', 'Iron chlorosis', 'Boron deficiency (hollow stem)', 'Manganese deficiency', 'Leaf yellowing'],
      preparationSteps: [
        { step: 1, title: 'Identify Deficiency', detail: 'Zinc: younger leaves pale yellow with green veins. Iron: interveinal chlorosis from youngest leaves. Boron: distorted growing tips, hollow tubers.' },
        { step: 2, title: 'Prepare Spray Solution', detail: 'Dissolve 1–1.5g per litre of clean water (250g per acre). Add to half-filled tank, stir well, top up.' },
        { step: 3, title: 'pH Check', detail: 'Spray solution pH should be 5.5–6.5 for best absorption. Add citric acid if water is alkaline (pH >7.5).' },
        { step: 4, title: 'Fine Mist Spray', detail: 'Use hollow cone nozzle at 40–45 PSI. Spray both surfaces of leaves — young leaves absorb micronutrients most rapidly.' },
        { step: 5, title: 'Repeat if Needed', detail: 'Severe deficiency: 2–3 sprays at 7–10 day intervals. Soil application of Zinc sulphate (25 kg/acre) recommended for long-term correction.' }
      ],
      warningNote: 'EDTA chelates may interact with alkaline pesticides. Add micronutrients last to spray tank. Do not mix with copper fungicides.',
      phiDays: 0,
      reentryHours: 1
    },
    reviews: [
      { id: 'r10', farmerName: 'Harpreet Singh', location: 'Bathinda, Punjab', rating: 5, date: '6 days ago', comment: 'Paddy showed yellow patches due to Zinc deficiency. Sprayed this chelate combo and within 3 days whole field turned emerald green.', cropGrown: 'Basmati Paddy', verified: true }
    ]
  },

  // ─── INSECTICIDES ─────────────────────────────────────────────────────────
  {
    id: 'imidacloprid-17sl',
    name: 'Imidacloprid 17.8% SL — Systemic Insecticide',
    brand: 'Agrow CropScience',
    type: 'Systemic insecticide',
    category: 'Insecticide',
    crop: 'Paddy, Chilli, Cotton, Vegetables, Pulses',
    price: 349,
    originalPrice: 480,
    unit: '250 ml',
    badge: 'WHO Class II Approved',
    tone: 'bg-red-100 text-red-800 border-red-300',
    rating: 4.7,
    reviewCount: 2100,
    inStock: true,
    stockCount: 35,
    deliveryDays: 'Tomorrow by 3 PM',
    seller: 'Agrow CropScience Dealer Network',
    composition: 'Imidacloprid 17.8% SL (Systemic neonicotinoid)',
    dosagePerAcre: '100–125 ml per acre in 200L water (0.5 ml/L spray)',
    applicationMethod: 'Foliar spray or soil drench at first pest appearance',
    suitableCrops: ['Paddy', 'Chilli', 'Cotton', 'Brinjal', 'Tomato', 'Okra', 'Wheat', 'Sugarcane'],
    description: 'Highly effective systemic neonicotinoid insecticide that moves through plant tissues to kill sucking pests feeding on leaves, stems, and roots. Controls BPH in paddy, jassids in cotton, and whiteflies in vegetables.',
    features: [
      'Systemic action — absorbed through roots and leaves for complete plant protection',
      'Residual activity up to 14–21 days after single application',
      'Controls all sucking pest complex (BPH, WBPH, thrips, aphids, jassids)',
      'Also effective as soil treatment for termite control and white grub',
      'CIB registered for major Indian crops'
    ],
    safetyAdvice: 'Highly toxic to honeybees — do not spray during flowering. Do not apply near water bodies. Use full PPE (gloves, mask, goggles). PHI: 14 days.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Imidacloprid.svg/320px-Imidacloprid.svg.png',
    usageGuide: {
      bestTime: 'Early morning or evening. NEVER spray during flowering — bee mortality risk is extreme.',
      pestsTargeted: ['Brown Plant Hopper (BPH) in Paddy', 'White-backed Plant Hopper (WBPH)', 'Jassids in Cotton', 'Whiteflies in Chilli/Tomato', 'Aphids', 'Thrips', 'Mealybugs'],
      preparationSteps: [
        { step: 1, title: 'Wear Full PPE', detail: 'Wear waterproof gloves, full-sleeve shirt, chemical-resistant goggles, and N95 or respirator mask. Never spray without PPE.' },
        { step: 2, title: 'Measure Accurately', detail: 'Use 0.5 ml per litre or 100–125 ml per acre in 200 litre water. Never exceed recommended dose — resistance develops.' },
        { step: 3, title: 'Prepare Solution', detail: 'Add measured dose to ¾ filled tank, stir for 2 minutes. Add remaining water. Do not premix with alkaline fungicides.' },
        { step: 4, title: 'Target Spray', detail: 'For BPH: spray lower canopy near water-soil junction. For sucking pests: spray underside of leaves. Avoid drift to flowering plants.' },
        { step: 5, title: 'Post-Spray Protocol', detail: 'Wash hands with soap. Rinse spray tank 3 times. Store leftover in cool, locked place. Observe 14-day PHI before harvest.' }
      ],
      warningNote: '⚠️ EXTREMELY TOXIC TO BEES. Do not apply when crop or nearby plants are in flower. Strictly observe 14-day pre-harvest interval. Not for home gardens.',
      phiDays: 14,
      reentryHours: 12
    },
    reviews: [
      { id: 'ri1', farmerName: 'Chandrakant Shinde', location: 'Nashik, Maharashtra', rating: 5, date: '1 week ago', comment: 'BPH attack in paddy was severe. One spray at recommended dose completely controlled it. Excellent systemic action.', cropGrown: 'Paddy', verified: true }
    ]
  },
  {
    id: 'chlorpyrifos-20ec',
    name: 'Chlorpyrifos 20% EC — Broad Spectrum Insecticide',
    brand: 'Dhanuka AgroStar',
    type: 'Contact insecticide',
    category: 'Insecticide',
    crop: 'Cotton, Chilli, Red Gram, Paddy, Vegetables',
    price: 299,
    originalPrice: 420,
    unit: '500 ml',
    badge: 'Proven Broad Spectrum',
    tone: 'bg-red-100 text-red-800 border-red-300',
    rating: 4.6,
    reviewCount: 1820,
    inStock: true,
    stockCount: 40,
    deliveryDays: 'Delivery in 2 Days',
    seller: 'Dhanuka Agri Dealer',
    composition: 'Chlorpyrifos 20% EC (Organophosphate contact insecticide)',
    dosagePerAcre: '300–400 ml per acre in 200L water (2 ml/L)',
    applicationMethod: 'Foliar spray targeting caterpillars and stem borers; soil drench for termites',
    suitableCrops: ['Cotton', 'Chilli', 'Red Gram', 'Green Gram', 'Paddy', 'Sugarcane', 'Maize', 'Wheat'],
    description: 'Classic broad-spectrum organophosphate contact insecticide with proven efficacy against caterpillars, borers, termites, and soil insects. Controls pod borer in red gram, stem borer in paddy, and bollworm in cotton.',
    features: [
      'Broad contact and stomach action against chewing insects',
      'Effective against diamond back moth (DBM) in brassicas',
      'Soil treatment controls white grub and termite colony',
      'Long-standing proven molecule with 50+ years of efficacy data',
      'Compatible with most common fungicide sprays'
    ],
    safetyAdvice: 'WHO Class II moderately hazardous. Wear full PPE. PHI: 15 days for vegetables, 21 days for paddy. Avoid contaminating water sources.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chlorpyrifos_structure.svg/320px-Chlorpyrifos_structure.svg.png',
    usageGuide: {
      bestTime: 'Early morning spray. Avoid windy conditions and rain within 4 hours of spray.',
      pestsTargeted: ['Pod borer (Red Gram / Pigeon Pea)', 'American bollworm (Cotton)', 'Stem borer (Paddy)', 'Caterpillars', 'Termites (soil treatment)', 'White grub'],
      preparationSteps: [
        { step: 1, title: 'PPE Preparation', detail: 'Essential PPE: chemical-resistant gloves, face shield, full-body coverall or rubber apron, gumboots. Organophosphates are skin-absorbed.' },
        { step: 2, title: 'Measure Dose', detail: '2 ml per litre for foliar spray. For soil drench (termite): 4 ml per litre. Never mix concentrateswithout diluting in water first.' },
        { step: 3, title: 'Scout Before Spray', detail: 'Count pest population: spray threshold for pod borer is 2+ larvae per plant or >5% pod damage. Spray early — small larvae easier to kill.' },
        { step: 4, title: 'Cover Crop Thoroughly', detail: 'For pod borers: spray into flower/pod clusters. For stem borer: direct spray at stem base junction. Ensure complete coverage.' },
        { step: 5, title: 'Resistance Management', detail: 'Rotate with non-organophosphate insecticide (e.g., Emamectin Benzoate, Spinosad) every alternate spray to prevent resistance buildup.' }
      ],
      warningNote: 'Organophosphate compound — causes cholinesterase inhibition. In case of accidental swallowing, antidote is ATROPINE (2mg IV). PHI: 15–21 days depending on crop.',
      phiDays: 15,
      reentryHours: 24
    },
    reviews: [
      { id: 'rc1', farmerName: 'Yogesh Bhange', location: 'Latur, Maharashtra', rating: 5, date: '2 days ago', comment: 'Pod borer in tur was causing 40% damage. Sprayed 2ml/L at pod filling stage. Within 48 hrs, caterpillar population collapsed. Excellent result.', cropGrown: 'Red Gram / Tur', verified: true }
    ]
  },
  {
    id: 'emamectin-benzoate-5sg',
    name: 'Emamectin Benzoate 5% SG — Caterpillar Specialist',
    brand: 'Syngenta Proclaim',
    type: 'Biological-derived insecticide',
    category: 'Insecticide',
    crop: 'Vegetables, Chilli, Cotton, Cabbage, Okra',
    price: 419,
    originalPrice: 580,
    unit: '100 g',
    badge: 'Best for Caterpillars',
    tone: 'bg-orange-100 text-orange-800 border-orange-300',
    rating: 4.9,
    reviewCount: 1480,
    inStock: true,
    stockCount: 25,
    deliveryDays: 'Tomorrow by 2 PM',
    seller: 'Syngenta Auth. Dealer',
    composition: 'Emamectin Benzoate 5% SG (Macrocyclic lactone — avermectin derivative)',
    dosagePerAcre: '100–150 g per acre in 200L water (0.5g/L)',
    applicationMethod: 'Foliar spray targeting caterpillar infestation',
    suitableCrops: ['Cabbage', 'Cauliflower', 'Tomato', 'Chilli', 'Cotton', 'Okra', 'Brinjal', 'Red Gram'],
    description: 'Premium macrocyclic lactone insecticide derived from soil bacteria. Paralyzes and kills caterpillars with translaminar action — even hidden caterpillars feeding inside leaves or rolled leaf shelters are controlled.',
    features: [
      'Translaminar action reaches caterpillars hidden inside folded leaves',
      'Long residual: 14–18 days protection after single spray',
      'Macrocyclic lactone with unique mode of action — no cross-resistance with organophosphates',
      'Extremely effective against diamond back moth (DBM) resistant to other insecticides',
      'Suitable for IPM programs — selective against beneficial insects at recommended rates'
    ],
    safetyAdvice: 'Keep away from water bodies — highly toxic to aquatic life. Observe strict 5-day PHI for leafy vegetables. Wear PPE during application.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Emamectin_benzoate.svg/320px-Emamectin_benzoate.svg.png',
    usageGuide: {
      bestTime: 'Apply when caterpillar eggs are hatching or 1st–2nd instar larvae visible. Morning spray preferred.',
      pestsTargeted: ['Diamond Back Moth (DBM) in Cabbage', 'Fruit & Shoot Borer in Brinjal', 'Spodoptera (Fall Armyworm)', 'Helicoverpa bollworm', 'Tobacco caterpillar (Spodoptera litura)', 'Beet armyworm'],
      preparationSteps: [
        { step: 1, title: 'Scouting First', detail: 'Look for characteristic damage: shot holes in leaves (DBM), wilted shoots (shoot borer), leaf rolling. Count larvae per plant — threshold is 1–2 larvae/plant.' },
        { step: 2, title: 'Dissolve Granules', detail: 'Emamectin SG dissolves quickly. Measure 0.5g per litre (100g per acre in 200L). Pre-mix in small cup of water before adding to tank.' },
        { step: 3, title: 'Add Sticker', detail: 'Add 0.5 ml/L of silicone-based sticker (like SPLASH) to improve wetting and translaminar penetration. This significantly increases efficacy.' },
        { step: 4, title: 'Thorough Spray', detail: 'Spray from all angles including inside leaf folds where caterpillars hide. Ensure spray reaches growing terminals and flower clusters.' },
        { step: 5, title: 'Resistance Rotation', detail: 'Rotate Emamectin with Chlorpyrifos or Spinosad in alternating sprays. Do not use >3 sprays per season to avoid resistance.' }
      ],
      warningNote: 'Extremely toxic to aquatic organisms — maintain 30m buffer from ponds and streams. PHI: 5 days for leafy vegetables, 7 days for fruiting vegetables, 21 days for paddy.',
      phiDays: 7,
      reentryHours: 12
    },
    reviews: [
      { id: 're1', farmerName: 'Harish Bhatt', location: 'Nashik, Maharashtra', rating: 5, date: '4 days ago', comment: 'DBM infestation was decimating my cabbage. Emamectin at 0.5g/L gave 95% control in 5 days. Even resistant strains were controlled. Superb product.', cropGrown: 'Cabbage & Cauliflower', verified: true }
    ]
  },
  {
    id: 'lambda-cyhalothrin-5ec',
    name: 'Lambda-Cyhalothrin 5% EC — Pyrethroid Insecticide',
    brand: 'Syngenta Karate',
    type: 'Pyrethroid contact insecticide',
    category: 'Insecticide',
    crop: 'Wheat, Cotton, Pulses, Soybean, Maize',
    price: 269,
    originalPrice: 380,
    unit: '250 ml',
    badge: 'Quick Knockdown Action',
    tone: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    rating: 4.7,
    reviewCount: 960,
    inStock: true,
    stockCount: 32,
    deliveryDays: 'Tomorrow by 4 PM',
    seller: 'Syngenta Auth. Dealer',
    composition: 'Lambda-Cyhalothrin 5% EC (Pyrethroid contact & stomach insecticide)',
    dosagePerAcre: '200–300 ml per acre in 200L water (1–1.5 ml/L)',
    applicationMethod: 'Foliar spray targeting external feeding insects',
    suitableCrops: ['Wheat', 'Maize', 'Soybean', 'Cotton', 'Red Gram', 'Green Gram', 'Sunflower', 'Potato'],
    description: 'Fast-acting pyrethroid insecticide with excellent knockdown speed. Controls armyworms, aphids, jassids, and pod borers with quick contact action. Low dose requirement and wide crop compatibility.',
    features: [
      'Rapid knockdown within 30–60 minutes of spray contact',
      'Repellent activity prevents re-infestation for 7–10 days',
      'Low dose rate — highly cost-effective per acre',
      'Compatible with most fungicides for tank mixing',
      'WHO Class II approved for use in Indian agriculture'
    ],
    safetyAdvice: 'Toxic to fish and aquatic life. Maintain 50m buffer from water bodies. Avoid spraying during bee activity hours. PHI: 14 days for most crops.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Lambda-cyhalothrin.svg/320px-Lambda-cyhalothrin.svg.png',
    usageGuide: {
      bestTime: 'Early morning (before 9 AM). Pyrethroids degrade rapidly in UV — evening application also suitable.',
      pestsTargeted: ['Armyworms in Wheat/Maize', 'Aphids in Wheat', 'Pod borers in Red/Green Gram', 'Jassids in Cotton', 'Spotted pod borer in Soybean'],
      preparationSteps: [
        { step: 1, title: 'Identify Pest', detail: 'Pyrethroids work best on external feeding caterpillars, aphids, and jassids. Not effective on BPH (plant hoppers) or soil insects.' },
        { step: 2, title: 'Mix 1–1.5 ml/L', detail: 'Measure carefully. Pyrethroids at excess concentration cause repellency without mortality. Add to ¾ filled tank and mix well.' },
        { step: 3, title: 'Add Sticker', detail: 'Pyrethroids wash off easily in rain. Add sticker at 0.5 ml/L for better rain fastness especially during monsoon.' },
        { step: 4, title: 'Spray Coverage', detail: 'Excellent contact action — spray must contact the pest directly. Walk forward (not into spray cloud) for uniform coverage.' },
        { step: 5, title: 'Rotate Molecules', detail: 'Pyrethroids have moderate resistance risk. Alternate with Imidacloprid or Chlorpyrifos to prevent resistance in pest populations.' }
      ],
      warningNote: 'Highly toxic to fish, aquatic invertebrates, and beneficial insects. PHI: 14 days. Do not spray near rivers, ponds, or during flowering (bee hazard).',
      phiDays: 14,
      reentryHours: 12
    },
    reviews: [
      { id: 'rl1', farmerName: 'Manoj Yadav', location: 'Jalgaon, Maharashtra', rating: 4, date: '2 weeks ago', comment: 'Quick knockdown on pod borers in tur. Within 1 hour of spray the caterpillars fell off the plants. Good product for rapid control.', cropGrown: 'Red Gram', verified: true }
    ]
  },
  {
    id: 'acephate-75sp',
    name: 'Acephate 75% SP — Chilli & Cotton Insecticide',
    brand: 'BASF Starthene',
    type: 'Systemic organophosphate insecticide',
    category: 'Insecticide',
    crop: 'Chilli, Cotton, Tobacco, Vegetables, Groundnut',
    price: 289,
    originalPrice: 399,
    unit: '250 g',
    badge: 'Chilli Specialist',
    tone: 'bg-red-100 text-red-800 border-red-300',
    rating: 4.7,
    reviewCount: 1240,
    inStock: true,
    stockCount: 28,
    deliveryDays: 'Delivery in 2 Days',
    seller: 'BASF Auth. Dealer',
    composition: 'Acephate 75% SP (Organophosphate systemic insecticide)',
    dosagePerAcre: '300–400 g per acre in 200L water (1.5–2 g/L)',
    applicationMethod: 'Foliar spray targeting sucking and chewing pests',
    suitableCrops: ['Chilli', 'Cotton', 'Groundnut', 'Tobacco', 'Tomato', 'Brinjal', 'Capsicum'],
    description: 'Versatile systemic organophosphate insecticide with both contact and systemic action. Highly effective against thrips, mites, aphids, and whiteflies in chilli — the most recommended insecticide for chilli thrips control in India.',
    features: [
      'Systemic + contact dual action for thorough pest control',
      'Highly effective against thrips in chilli and cotton',
      'Controls mites in tandem with acaricides',
      'Soluble powder — clean and easy to measure and dissolve',
      'Good compatibility with most agricultural pesticides'
    ],
    safetyAdvice: 'WHO Class II. Full PPE mandatory. PHI: 7 days for chilli, 14 days for cotton. Not for use near water bodies.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Acephate.svg/320px-Acephate.svg.png',
    usageGuide: {
      bestTime: 'Early morning spray for maximum efficacy. Cool temperatures enhance systemic absorption.',
      pestsTargeted: ['Thrips in Chilli', 'Whiteflies in Chilli/Tomato', 'Aphids', 'Jassids in Cotton', 'Mites (partial control)', 'Mealy bugs'],
      preparationSteps: [
        { step: 1, title: 'Dissolve Powder', detail: 'Add 1.5–2g per litre. Dissolve in small amount of warm water first. Acephate SP is very soluble and mixes fast.' },
        { step: 2, title: 'Scout Threshold', detail: 'Spray for thrips when 5–6 thrips per flower OR sticky trap catch >20/day. Early-stage thrips easier to control.' },
        { step: 3, title: 'Target Flowers & Tips', detail: 'Thrips hide inside chilli flowers and buds. Direct spray into flowers and growing tips where thrips congregate.' },
        { step: 4, title: 'Repeat in 7 Days', detail: 'Acephate has 7–10 day residual. Second spray after 7 days controls newly hatched thrips from eggs not killed in first spray.' },
        { step: 5, title: 'Alternate with Spinosad', detail: 'To prevent thrips resistance, alternate Acephate with Spinosad or Abamectin. Never repeat same molecule for 3+ consecutive sprays.' }
      ],
      warningNote: 'Cholinesterase inhibitor — antidote is ATROPINE. Very effective against thrips but resistance developing in some districts. Rotate molecules every season.',
      phiDays: 7,
      reentryHours: 12
    },
    reviews: [
      { id: 'ra1', farmerName: 'Suresh Gaddam', location: 'Guntur, Andhra Pradesh', rating: 5, date: '3 days ago', comment: 'Thrips in chilli flowers was the main problem. Acephate 2g/L with sticker completely solved it in 2 sprays. Flower drop stopped and chilli set improved dramatically.', cropGrown: 'Guntur Chilli (S4)', verified: true }
    ]
  },
  {
    id: 'spinosad-45sc',
    name: 'Spinosad 45% SC — Bio-derived IPM Insecticide',
    brand: 'Dow Tracer',
    type: 'Macrocyclic lactone bio-insecticide',
    category: 'Bio-pesticide',
    crop: 'Vegetables, Fruit crops, Chilli, Cotton, Paddy',
    price: 899,
    originalPrice: 1199,
    unit: '100 ml',
    badge: 'Certified for Organic IPM',
    tone: 'bg-green-100 text-green-900 border-green-300',
    rating: 4.8,
    reviewCount: 720,
    inStock: true,
    stockCount: 18,
    deliveryDays: 'Tomorrow by 2 PM',
    seller: 'Dow AgroSciences Dealer',
    composition: 'Spinosad 45% SC (natural product from Saccharopolyspora spinosa fermentation)',
    dosagePerAcre: '60–80 ml per acre in 200L water (0.3–0.4 ml/L)',
    applicationMethod: 'Foliar spray targeting caterpillars and thrips',
    suitableCrops: ['Tomato', 'Chilli', 'Cabbage', 'Cotton', 'Mango', 'Paddy', 'Okra'],
    description: 'Premium bio-derived insecticide from natural soil bacteria fermentation. Suitable for organic certification programs. Highly effective against thrips and caterpillars while being safe to beneficial insects, bees, and parasitoids.',
    features: [
      'Natural fermentation product — approved for organic farming (Jaivik Bharat)',
      'Dual mode of action: excitatory followed by paralysis in pests',
      'Safe for bees and beneficial insects at recommended rates',
      'Zero cross-resistance with organophosphates and pyrethroids',
      'Excellent for IPM programs as non-toxic rotation partner'
    ],
    safetyAdvice: 'Avoid spraying during bee activity. Mildly toxic to aquatic crustaceans. PHI: 3 days for vegetables — short pre-harvest interval is major advantage.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Spinosad_A.svg/320px-Spinosad_A.svg.png',
    usageGuide: {
      bestTime: 'Morning spray preferred. Excellent IPM tool — use it as every-other-spray rotation partner.',
      pestsTargeted: ['Thrips in Chilli, Tomato, Onion', 'Caterpillars (Spodoptera, Helicoverpa)', 'Diamond Back Moth', 'Fruit fly control (bait)'],
      preparationSteps: [
        { step: 1, title: 'Use Early in Season', detail: 'Spinosad works best on young larvae and thrips. Early application before severe infestation gives best results.' },
        { step: 2, title: 'Low Dose — High Activity', detail: 'Only 0.3–0.4 ml per litre (60–80 ml per acre). Very low dose requirement. Measure carefully — excess wastes product.' },
        { step: 3, title: 'Mix with Sticker', detail: 'Add food-grade sticker for better adhesion. Spinosad degrades in UV over 7 days — sticker helps maintain residual.' },
        { step: 4, title: 'Spray During Pest Activity', detail: 'Thrips are most active and in open positions early morning. Caterpillars easier to spray when feeding externally.' },
        { step: 5, title: 'Maximum 3 Sprays/Season', detail: 'To preserve Spinosad efficacy long-term, limit to 3 applications per crop season. Rotate with Emamectin Benzoate or Chlorpyrifos.' }
      ],
      warningNote: 'Resistance risk is real — do not use >3 times per crop season. Store in original sealed container below 25°C. PHI: 3 days makes it ideal pre-harvest.',
      phiDays: 3,
      reentryHours: 4
    },
    reviews: [
      { id: 'rs1', farmerName: 'Priyanka Gaikwad', location: 'Jalgaon, Maharashtra', rating: 5, date: '1 week ago', comment: 'Using Spinosad as rotation with Acephate for chilli thrips management. Excellent control. The 3-day PHI means I can spray even close to picking time safely.', cropGrown: 'Green Chilli', verified: true }
    ]
  },
  {
    id: 'profenofos-50ec',
    name: 'Profenofos 50% EC — Cotton Bollworm Control',
    brand: 'Syngenta Curacron',
    type: 'Organophosphate insecticide',
    category: 'Insecticide',
    crop: 'Cotton, Chilli, Soybean, Groundnut',
    price: 349,
    originalPrice: 489,
    unit: '500 ml',
    badge: 'Cotton Standard',
    tone: 'bg-red-100 text-red-800 border-red-300',
    rating: 4.8,
    reviewCount: 1560,
    inStock: true,
    stockCount: 30,
    deliveryDays: 'Delivery in 2 Days',
    seller: 'Syngenta Auth. Dealer',
    composition: 'Profenofos 50% EC (Organophosphate-contact insecticide)',
    dosagePerAcre: '400–500 ml per acre in 200L water (2 ml/L)',
    applicationMethod: 'Foliar spray for bollworm and other pest control in cotton',
    suitableCrops: ['Cotton', 'Chilli', 'Soybean', 'Groundnut', 'Brinjal', 'Tomato'],
    description: 'Industry-standard organophosphate insecticide for cotton bollworm management. Also effective on Spodoptera (armyworm) in soybean and groundnut. Combines contact and partial systemic action.',
    features: [
      'Standard cotton bollworm management insecticide in India',
      'Effective against Helicoverpa armigera bollworm complex',
      'Controls Spodoptera litura (tobacco caterpillar) in groundnut/soybean',
      'Moderate systemic activity ensures coverage of hidden larvae',
      'Cost-effective price point for large-scale cotton farmers'
    ],
    safetyAdvice: 'WHO Class II. Full PPE essential. PHI: 21 days for cotton. Avoid drift to non-target areas.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Profenofos.svg/320px-Profenofos.svg.png',
    usageGuide: {
      bestTime: 'Spray at early boll development stage when bollworm egg hatching is expected. Monitor pheromone traps.',
      pestsTargeted: ['Cotton Bollworm (Helicoverpa)', 'Pink Bollworm', 'Spodoptera litura', 'Tobacco caterpillar in Groundnut', 'Fruit & pod borers'],
      preparationSteps: [
        { step: 1, title: 'Pheromone Trap Monitoring', detail: 'Use Helicoverpa pheromone traps (5 per acre). When catch exceeds 5–6 moths/trap/day, initiate spray program.' },
        { step: 2, title: 'Egg Mass Scouting', detail: 'Check 10 plants per acre for egg masses on leaves and flowers. Spray when 5–10% plants have egg masses or small larvae.' },
        { step: 3, title: 'Spray 2 ml/L', detail: 'Add 2 ml Curacron per litre. Fill tank ¾, add concentrate, stir, top up. Use high-volume (200L/acre) application for thorough coverage.' },
        { step: 4, title: 'Target Growing Points', detail: 'Bollworms initially feed on flowers, squares, and young bolls. Direct spray at these plant parts. Cover bollgone area especially.' },
        { step: 5, title: 'Second Spray at 7 Days', detail: 'If infestation is severe, repeat after 7–10 days. Observe 21-day PHI strictly. Rotate with non-organophosphate molecule next spray.' }
      ],
      warningNote: 'PHI: 21 days (cotton). Organophosphate — antidote: ATROPINE. High resistance to bollworm developing in some cotton belts. Rotate with Bt, Spinosad, or Emamectin.',
      phiDays: 21,
      reentryHours: 24
    },
    reviews: [
      { id: 'rp1', farmerName: 'Dinesh Chaudhari', location: 'Amravati, Maharashtra', rating: 4, date: '3 weeks ago', comment: 'Profenofos is our go-to for Helicoverpa in cotton. Effective at boll formation stage. Good product, real Syngenta quality.', cropGrown: 'Bt Cotton', verified: true }
    ]
  },

  // ─── FUNGICIDES ───────────────────────────────────────────────────────────
  {
    id: 'mancozeb-75wp',
    name: 'Mancozeb 75% WP — Multi-target Fungicide',
    brand: 'Indofil M-45',
    type: 'Protective fungicide',
    category: 'Fungicide',
    crop: 'Tomato, Chilli, Potato, Grapes, Onion, Paddy',
    price: 249,
    originalPrice: 349,
    unit: '500 g',
    badge: 'India #1 Fungicide',
    tone: 'bg-blue-100 text-blue-800 border-blue-300',
    rating: 4.8,
    reviewCount: 3800,
    inStock: true,
    stockCount: 55,
    deliveryDays: 'Tomorrow by 11 AM',
    seller: 'Indofil Industries Dealer',
    composition: 'Mancozeb 75% WP (Dithiocarbamate multi-site protective fungicide)',
    dosagePerAcre: '500–600 g per acre in 200L water (2.5–3 g/L)',
    applicationMethod: 'Preventive foliar spray starting before disease onset',
    suitableCrops: ['Tomato', 'Chilli', 'Potato', 'Grapes', 'Onion', 'Paddy', 'Mango', 'Groundnut', 'Green Gram', 'Red Gram'],
    description: 'India\'s most widely used protective fungicide with multi-site action against a wide range of fungal diseases. Prevents early blight, late blight, downy mildew, anthracnose, and leaf spot in vegetables and fruits.',
    features: [
      'Multi-site action — extremely low resistance risk compared to single-site fungicides',
      'Effective against Alternaria, Phytophthora, Downy Mildew, and Anthracnose',
      'Also provides secondary zinc and manganese micronutrient benefit',
      'Rain-fast within 2 hours of spray drying on leaf',
      'Cost-effective — lowest cost per acre among fungicide molecules'
    ],
    safetyAdvice: 'Avoid inhalation of dust. Wear N95 mask. PHI: 10 days for tomato, 15 days for grapes. Do not mix with alkaline products (Bordeaux mixture).',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mancozeb.svg/320px-Mancozeb.svg.png',
    usageGuide: {
      bestTime: 'Preventive sprays before rain or disease onset. Start at transplanting and repeat every 7–10 days during disease season.',
      pestsTargeted: ['Early Blight (Alternaria) in Tomato/Potato', 'Late Blight (Phytophthora) in Potato', 'Downy Mildew in Grapes/Onion', 'Anthracnose in Chilli/Mango', 'Leaf spot diseases', 'Sigatoka in Banana'],
      preparationSteps: [
        { step: 1, title: 'Preventive Timing', detail: 'Start Mancozeb spray program BEFORE disease appears — it is protective, not curative. Begin at transplanting and maintain 7–10 day schedule during wet weather.' },
        { step: 2, title: 'Prepare Suspension', detail: 'Pre-mix 2.5–3g per litre in a paste with small water before adding to tank. Stir vigorously. WP formulations need thorough mixing to avoid settling.' },
        { step: 3, title: 'Continuous Agitation', detail: 'Keep knapsack or pump-sprayer agitated during application. Mancozeb settles fast in tank — re-stir every 5 minutes.' },
        { step: 4, title: 'Complete Coverage', detail: 'Spray both leaf surfaces thoroughly. Mancozeb works only where it physically covers the leaf — no systemic protection. Coverage is everything.' },
        { step: 5, title: 'Rotate with Systemic', detail: 'Alternate Mancozeb (protective) with systemic fungicide like Propiconazole or Metalaxyl for complete disease management.' }
      ],
      warningNote: 'Mancozeb is protective only — if disease has already spread, add a systemic fungicide. PHI: 10 days (vegetables), 15 days (grapes). Avoid inhalation of powder.',
      phiDays: 10,
      reentryHours: 24
    },
    reviews: [
      { id: 'rm1', farmerName: 'Raju Thorat', location: 'Nashik, Maharashtra', rating: 5, date: '1 day ago', comment: 'Using Indofil M-45 every 8 days in tomato. Zero early blight in my field while neighbors lost 50% crop. True crop protector.', cropGrown: 'Tomato', verified: true }
    ]
  },
  {
    id: 'carbendazim-50wp',
    name: 'Carbendazim 50% WP — Systemic Fungicide',
    brand: 'Bayer Bavistin',
    type: 'Systemic fungicide',
    category: 'Fungicide',
    crop: 'Paddy, Wheat, Chilli, Tomato, Pulses, Banana',
    price: 219,
    originalPrice: 299,
    unit: '250 g',
    badge: 'Proven Systemic Curative',
    tone: 'bg-blue-100 text-blue-800 border-blue-300',
    rating: 4.6,
    reviewCount: 2450,
    inStock: true,
    stockCount: 42,
    deliveryDays: 'Tomorrow by 1 PM',
    seller: 'Bayer CropScience Dealer',
    composition: 'Carbendazim 50% WP (Benzimidazole systemic fungicide)',
    dosagePerAcre: '200–250 g per acre in 200L water (1–1.25 g/L)',
    applicationMethod: 'Foliar spray or soil drench for seed-borne and soil-borne fungi',
    suitableCrops: ['Paddy', 'Wheat', 'Chilli', 'Tomato', 'Green Gram', 'Red Gram', 'Banana', 'Maize'],
    description: 'Classic systemic benzimidazole fungicide with curative and protective action. Absorbed into plant system and translocates acropetally to control powdery mildew, sheath blight, Fusarium, and smut diseases.',
    features: [
      'Systemic curative action — controls existing infections, not just preventive',
      'Excellent against powdery mildew in vegetables and Sheath Blight in paddy',
      'Seed treatment controls seed-borne diseases (loose smut, Karnal bunt in wheat)',
      'Soil drench application controls Fusarium wilt effectively',
      'Broad spectrum: effective against 70+ fungal diseases'
    ],
    safetyAdvice: 'Resistance developing in some pathogens — rotate with Propiconazole or Mancozeb. PHI: 7 days for vegetables. Avoid prolonged exposure.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Carbendazim.svg/320px-Carbendazim.svg.png',
    usageGuide: {
      bestTime: 'Apply at first sign of disease or as curative spray when infection has just started. Also as preventive during high disease risk periods.',
      pestsTargeted: ['Sheath Blight in Paddy', 'Powdery Mildew in Chilli/Tomato/Vegetables', 'Fusarium Wilt (soil drench)', 'Loose Smut & Karnal Bunt in Wheat', 'Leaf spot in Green Gram'],
      preparationSteps: [
        { step: 1, title: 'Seed Treatment', detail: 'For seed treatment: dissolve 2.5g per kg of seed in water. Coat seeds uniformly and shade dry 30 min before sowing. Controls seed-borne fungi.' },
        { step: 2, title: 'Foliar Mix', detail: '1–1.25g per litre for foliar spray. Dissolve in small water first, add to tank. Carbendazim dissolves cleanly — no residue.' },
        { step: 3, title: 'Tank Mix Option', detail: 'Carbendazim + Mancozeb is a classic combination: systemic + protective dual action. This combination registered for multiple crops.' },
        { step: 4, title: 'Sheath Blight Spray', detail: 'For Sheath Blight in paddy: spray into canopy, targeting leaf sheath junction. Two sprays at 10-day interval gives best control.' },
        { step: 5, title: 'Resistance Prevention', detail: 'Limit to 2–3 sprays per season. Resistance in Fusarium and powdery mildew pathogens is now common. Rotate with Propiconazole or Tebuconazole.' }
      ],
      warningNote: 'Carbendazim resistance is a serious issue in many pathogens. Do not rely solely on this molecule. Always rotate with other mode-of-action fungicides.',
      phiDays: 7,
      reentryHours: 12
    },
    reviews: [
      { id: 'rcb1', farmerName: 'Bhushan Jadhav', location: 'Kolhapur, Maharashtra', rating: 4, date: '2 weeks ago', comment: 'Good for Sheath Blight control in paddy. 2 sprays at the right stage gave 70% control. Mixed with Mancozeb for better results.', cropGrown: 'Paddy', verified: true }
    ]
  },
  {
    id: 'propiconazole-25ec',
    name: 'Propiconazole 25% EC — Paddy & Wheat Fungicide',
    brand: 'Syngenta Tilt',
    type: 'Systemic triazole fungicide',
    category: 'Fungicide',
    crop: 'Paddy, Wheat, Maize, Sugarcane, Banana',
    price: 399,
    originalPrice: 549,
    unit: '250 ml',
    badge: 'Paddy Blast Specialist',
    tone: 'bg-blue-100 text-blue-800 border-blue-300',
    rating: 4.9,
    reviewCount: 1950,
    inStock: true,
    stockCount: 25,
    deliveryDays: 'Tomorrow by 3 PM',
    seller: 'Syngenta Auth. Dealer',
    composition: 'Propiconazole 25% EC (Triazole demethylation inhibitor fungicide)',
    dosagePerAcre: '200 ml per acre in 200L water (1 ml/L)',
    applicationMethod: 'Foliar spray at leaf blast or sheath rot appearance in paddy',
    suitableCrops: ['Paddy', 'Wheat', 'Maize', 'Sugarcane', 'Banana', 'Mango', 'Turmeric'],
    description: 'Premium triazole systemic fungicide from Syngenta. Industry standard for Paddy Blast (Magnaporthe oryzae), Sheath Rot, and Grain Discoloration control. Also controls Powdery Mildew and Rust in wheat.',
    features: [
      'Systemic sterol inhibitor — curative and preventive action against Blast',
      'Also shows plant growth regulation (greening effect) at recommended doses',
      'Long residual 14–21 days — fewer sprays needed per season',
      'Key molecule for paddy blast management at heading stage',
      'Controls False Smut in paddy and Leaf Rust in wheat'
    ],
    safetyAdvice: 'PHI: 10 days for paddy. Triazoles may have plant regulatory effects at excess dose — do not exceed 1 ml/L. Wear PPE during spray.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Propiconazole.svg/320px-Propiconazole.svg.png',
    usageGuide: {
      bestTime: 'Apply at boot leaf stage to heading stage in paddy. For wheat: at flag leaf and heading stage.',
      pestsTargeted: ['Paddy Blast (Leaf Blast, Neck Blast)', 'Sheath Rot in Paddy', 'False Smut in Paddy', 'Leaf Rust in Wheat', 'Powdery Mildew in Wheat/Maize', 'Sigatoka Leaf Spot in Banana'],
      preparationSteps: [
        { step: 1, title: 'Disease Scouting', detail: 'Watch for Leaf Blast: diamond-shaped lesions with gray center. Neck Blast: breaks at panicle neck. Spray immediately at first leaf lesion.' },
        { step: 2, title: 'Measure 1 ml/L', detail: 'Propiconazole EC — measure 1 ml per litre (200 ml per acre in 200L water). Accurate dosing is critical — excess causes phytotoxicity.' },
        { step: 3, title: 'Prepare Emulsion', detail: 'Add EC concentrate slowly to water while stirring. It emulsifies cleanly in water at all temperatures.' },
        { step: 4, title: 'High Volume Spray', detail: 'Use minimum 200L water per acre. For neck blast: ensure spray reaches the flag leaf and panicle base. Use power sprayer for rice fields.' },
        { step: 5, title: 'Two-Spray Program', detail: 'First spray at boot/heading stage. Second spray 10 days later at flowering covers the most critical blast-vulnerable stages.' }
      ],
      warningNote: 'Do not exceed 1 ml/L — higher doses cause plant growth suppression (shortened internodes). PHI: 10 days (paddy), 14 days (wheat).',
      phiDays: 10,
      reentryHours: 12
    },
    reviews: [
      { id: 'rpr1', farmerName: 'Ramesh Nair', location: 'Thrissur, Kerala', rating: 5, date: '1 week ago', comment: 'Blast was destroying my paddy at heading stage. Emergency spray of Tilt at boot stage saved the entire crop. Neck break rate dropped from 35% to 3%. Excellent product.', cropGrown: 'Jyothi Paddy', verified: true }
    ]
  },
  {
    id: 'metalaxyl-mancozeb',
    name: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)',
    brand: 'Syngenta Ridomil Gold',
    type: 'Systemic + Protective fungicide combination',
    category: 'Fungicide',
    crop: 'Potato, Tomato, Ginger, Chilli, Grapes, Onion',
    price: 549,
    originalPrice: 750,
    unit: '250 g',
    badge: 'Late Blight Specialist',
    tone: 'bg-blue-100 text-blue-800 border-blue-300',
    rating: 4.9,
    reviewCount: 1340,
    inStock: true,
    stockCount: 20,
    deliveryDays: 'Tomorrow by 4 PM',
    seller: 'Syngenta Auth. Dealer',
    composition: 'Metalaxyl 8% + Mancozeb 64% WP (Phenylamide + Dithiocarbamate combination)',
    dosagePerAcre: '500–600 g per acre in 200L water (2.5–3 g/L)',
    applicationMethod: 'Preventive foliar spray or soil drench for Oomycete disease control',
    suitableCrops: ['Potato', 'Tomato', 'Ginger', 'Turmeric', 'Chilli', 'Grapes', 'Onion', 'Chilgoza'],
    description: 'The gold standard for Late Blight (Phytophthora), Downy Mildew, and Pythium diseases. Metalaxyl (systemic) + Mancozeb (protective) combination provides both curative action inside plant and surface protection.',
    features: [
      'Metalaxyl targets Oomycetes specifically (Phytophthora, Pythium, Peronospora)',
      'Mancozeb provides broad-spectrum protective barrier',
      'Systemic metalaxyl absorbed into plant for internal protection',
      'Standard recommendation for late blight prevention in potato and tomato',
      'Also as soil drench for Pythium damping-off in nurseries'
    ],
    safetyAdvice: 'Metalaxyl resistance has developed in some Phytophthora strains — alternate with Cymoxanil. PHI: 7 days. Wear face mask when mixing.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Metalaxyl.svg/320px-Metalaxyl.svg.png',
    usageGuide: {
      bestTime: 'Apply preventively 5–7 days before expected rain and high humidity conditions. Late blight spreads explosively in cool, wet weather.',
      pestsTargeted: ['Late Blight (Phytophthora infestans) in Potato/Tomato', 'Downy Mildew in Grapes/Onion', 'Pythium Rot in Ginger/Nursery', 'Oomycete soil-borne diseases'],
      preparationSteps: [
        { step: 1, title: 'Weather Monitoring', detail: 'Late blight develops when temperature is 10–20°C with >90% humidity for 2+ days. Initiate spray program at weather forecast of rain.' },
        { step: 2, title: 'Prepare Suspension', detail: 'Mix 2.5–3g/L. Pre-mix in paste with small water before adding to spray tank. WP formulation needs thorough dissolution.' },
        { step: 3, title: 'Spray Timing is Critical', detail: 'Apply BEFORE rain event, not after. Once Late Blight lesions cover >10% leaf area, switch to curative molecules.' },
        { step: 4, title: 'Cover Lower Canopy', detail: 'Phytophthora spores splashed from soil infect lower leaves first. Direct spray toward lower and mid canopy with upward angle.' },
        { step: 5, title: 'Rotation Required', detail: 'Never use Ridomil Gold >3 times per season. Rotate with Fosetyl-Al or Cymoxanil+Mancozeb to manage Metalaxyl resistance.' }
      ],
      warningNote: 'Metalaxyl resistance is common in P. infestans in potato regions. If control failure occurs, switch to Cymoxanil + Mancozeb or Mandipropamid. PHI: 7 days.',
      phiDays: 7,
      reentryHours: 12
    },
    reviews: [
      { id: 'rrg1', farmerName: 'Sanjay Kumbhar', location: 'Satara, Maharashtra', rating: 5, date: '5 days ago', comment: 'Saved my ginger crop from rhizome rot using Ridomil Gold drench. Applied at planting and again at 30 days. Near zero damping off this season.', cropGrown: 'Ginger', verified: true }
    ]
  },

  // ─── BIO-PESTICIDES ───────────────────────────────────────────────────────
  {
    id: 'beauveria-bassiana',
    name: 'Beauveria bassiana 1.15% WP — Entomopathogenic Fungus',
    brand: 'Biocontrol Labs BioMagic',
    type: 'Entomopathogenic fungus bio-pesticide',
    category: 'Bio-pesticide',
    crop: 'Cotton, Chilli, Vegetables, Groundnut, Sugarcane',
    price: 249,
    originalPrice: 349,
    unit: '1 kg',
    badge: 'Organic Certified IPM',
    tone: 'bg-green-100 text-green-900 border-green-300',
    rating: 4.5,
    reviewCount: 480,
    inStock: true,
    stockCount: 22,
    deliveryDays: 'Delivery in 2 Days',
    seller: 'Biocontrol Research Labs',
    composition: 'Beauveria bassiana 1.15% WP (minimum 2 x 10^8 viable spores per gram)',
    dosagePerAcre: '2–3 kg per acre in 200L water (10–15 g/L)',
    applicationMethod: 'Foliar spray or soil application for pest control',
    suitableCrops: ['Cotton', 'Chilli', 'Tomato', 'Brinjal', 'Groundnut', 'Sugarcane', 'Red Gram'],
    description: 'Natural soil fungus that parasitizes and kills insects on contact. Spores germinate on pest cuticle, penetrate inside, and kill within 3–7 days. Effective against whiteflies, aphids, thrips, and some beetles without harming beneficials.',
    features: [
      'Natural entomopathogenic fungus — OMRI listed for organic farming',
      'Kills whiteflies, aphids, thrips, jassids by contact germination',
      'Multiplies and spreads in pest population (secondary infection)',
      'No resistance development — biological mode of action',
      'Safe for farmers, consumers, birds, and beneficial insects'
    ],
    safetyAdvice: 'Store in cool location (4–15°C). Avoid mixing with chemical fungicides. Spray in evening — sunlight reduces spore viability.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Beauveria_bassiana.jpg/640px-Beauveria_bassiana.jpg',
    usageGuide: {
      bestTime: 'Evening application (after 5 PM) when humidity is higher and UV radiation is lower — critical for spore survival',
      pestsTargeted: ['Whiteflies', 'Aphids', 'Thrips', 'Jassids', 'Mealybugs', 'Weevils', 'Termites (soil application)'],
      preparationSteps: [
        { step: 1, title: 'Check Expiry & Storage', detail: 'Verify product is not expired. Check spore viability. Store at 4–15°C — excessive heat kills spores before use.' },
        { step: 2, title: 'Evening Spray Only', detail: 'MUST spray in evening (after 5 PM). UV radiation destroys spores within 2 hours in direct sunlight. Morning spray wasteful.' },
        { step: 3, title: 'High Humidity Conditions', detail: 'Beauveria needs humidity >70% to germinate on pest. Apply before expected foggy or misty conditions for best results.' },
        { step: 4, title: 'Complete Coverage', detail: 'Contact fungus — spores must physically touch the pest. Thorough spray coverage including leaf undersides is critical.' },
        { step: 5, title: 'Weekly Application', detail: 'Repeat weekly for active infestation. Beauveria has slower action (3–7 days kill time) — continue even after pest numbers seem to reduce.' }
      ],
      warningNote: 'Very slow-acting compared to chemical pesticides. For severe infestations, use with a quick-knockdown chemical pesticide first, then switch to Beauveria for sustained control.',
      phiDays: 1,
      reentryHours: 2
    },
    reviews: [
      { id: 'rb1', farmerName: 'Prashant Mane', location: 'Jalna, Maharashtra', rating: 4, date: '3 weeks ago', comment: 'Using Beauveria as part of IPM for chilli thrips. Slower than chemicals but by week 2 the thrips population had completely crashed. Good organic tool.', cropGrown: 'Chilli', verified: true }
    ]
  },
  {
    id: 'bacillus-thuringiensis',
    name: 'Bacillus thuringiensis (Bt) var. kurstaki WP',
    brand: 'Neem Biotech Delfin',
    type: 'Bacterial bio-insecticide',
    category: 'Bio-pesticide',
    crop: 'Cabbage, Cotton, Vegetables, Red Gram, Tomato',
    price: 329,
    originalPrice: 449,
    unit: '500 g',
    badge: 'Zero Residue Organic',
    tone: 'bg-green-100 text-green-900 border-green-300',
    rating: 4.7,
    reviewCount: 820,
    inStock: true,
    stockCount: 28,
    deliveryDays: 'Tomorrow by 3 PM',
    seller: 'Biocontrol Research Labs',
    composition: 'Bacillus thuringiensis var. kurstaki (5000 IU/mg). Fermentation dried WP formulation',
    dosagePerAcre: '500g–1 kg per acre in 200L water (2.5–5 g/L)',
    applicationMethod: 'Foliar spray targeting young caterpillar larvae',
    suitableCrops: ['Cabbage', 'Cauliflower', 'Cotton', 'Tomato', 'Red Gram', 'Green Gram', 'Soybean', 'Brinjal'],
    description: 'The world\'s most widely used biological insecticide — natural soil bacterium that produces protein crystals (Cry toxins) lethal specifically to moth and butterfly larvae (Lepidoptera) while safe to all other organisms.',
    features: [
      'Highly specific — only kills caterpillar (Lepidoptera) larvae, no collateral damage',
      'Zero residue — approved for use right up to harvest day',
      'No pre-harvest interval — safe for direct consumption crops',
      'Natural fermentation product — OMRI certified for organic farming',
      'No known resistance development in field populations'
    ],
    safetyAdvice: 'Store below 25°C away from direct sunlight. Use within 2 years of manufacture. Spray in evening or early morning for best results.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Bacillus_thuringiensis_phase.jpg/640px-Bacillus_thuringiensis_phase.jpg',
    usageGuide: {
      bestTime: 'Apply when eggs are hatching (early instar larvae, 1st–2nd stage). Evening spray preferred — Bt proteins degrade in UV within 24–48 hours.',
      pestsTargeted: ['Diamond Back Moth (DBM) in Cabbage/Cauliflower', 'Helicoverpa bollworm', 'Spodoptera armyworm', 'Pod borer in Red Gram', 'Tobacco caterpillar'],
      preparationSteps: [
        { step: 1, title: 'Time to Egg Hatch', detail: 'Bt kills small larvae but is INEFFECTIVE against large caterpillars (>3rd instar). Scout egg masses and spray at egg hatch for best results.' },
        { step: 2, title: 'Mix 2.5–5 g/L', detail: 'Dissolve 2.5–5g per litre with thorough stirring. Add small amount of jaggery or sugar (5g/L) to attract larvae to spray deposits.' },
        { step: 3, title: 'Evening Spray Mandatory', detail: 'UV destroys Bt protein crystals within 24–48 hours. Spray after 5 PM. Morning re-spray if previous evening was missed due to rain.' },
        { step: 4, title: 'Cover Growing Tips', detail: 'Young caterpillars are on growing points and young leaves. Target spray at these areas including new growth and leaf undersides.' },
        { step: 5, title: 'Repeat Every 5–7 Days', detail: 'Bt has short residual life (3–5 days). Repeat every 5–7 days during pest pressure. Safe to spray until day of harvest — zero residue.' }
      ],
      warningNote: 'Bt works ONLY on caterpillar (Lepidoptera) larvae — ineffective on sucking pests (aphids, whitefly) or adult moths. Must be ingested to work. No contact action.',
      phiDays: 0,
      reentryHours: 0
    },
    reviews: [
      { id: 'rbt1', farmerName: 'Vandana Kulkarni', location: 'Pune, Maharashtra', rating: 5, date: '1 week ago', comment: 'Perfect for my organic vegetable farm. Spray Bt for DBM every 6 days. Zero caterpillar damage. No residue issue even for direct market sales.', cropGrown: 'Cabbage & Tomato', verified: true }
    ]
  },

  // ─── SPECIALTY FERTILIZERS ────────────────────────────────────────────────
  {
    id: 'zinc-sulphate-33',
    name: 'Zinc Sulphate 33% (Monohydrate) — Deficiency Corrector',
    brand: 'Kisan Ratna ZnSO4',
    type: 'Micronutrient fertilizer',
    category: 'Micronutrient',
    crop: 'Paddy, Wheat, Maize, Citrus, Vegetables',
    price: 249,
    originalPrice: 349,
    unit: '5 kg',
    badge: 'FCO Certified Zinc',
    tone: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    rating: 4.7,
    reviewCount: 1260,
    inStock: true,
    stockCount: 38,
    deliveryDays: 'Tomorrow by 2 PM',
    seller: 'Kisan Krishi Kendra (Govt Authorized)',
    composition: 'Zinc Sulphate Monohydrate (Zn 33% min, S 16%)',
    dosagePerAcre: 'Soil: 10–25 kg per acre; Foliar: 5g/L + 2g/L lime',
    applicationMethod: 'Soil broadcasting before sowing or foliar spray as 0.5% solution',
    suitableCrops: ['Paddy (Khaira)', 'Wheat', 'Maize', 'Citrus', 'Vegetables', 'Sugarcane', 'Onion'],
    description: 'Essential zinc micronutrient corrector for Zinc-deficient soils prevalent across India. Zinc deficiency (Khaira) is the most widespread micronutrient deficiency in Indian paddy soils. Also provides sulphur (16%).',
    features: [
      'Corrects Khaira disease (Zinc deficiency) in paddy rapidly',
      'Provides dual nutrition: Zinc + Sulphur in one application',
      'Improves grain quality, head formation, and crop maturity',
      'FCO certified 33% Zinc content — higher than heptahydrate form',
      'Can be applied via soil or foliar depending on severity'
    ],
    safetyAdvice: 'Do not mix with superphosphate in same spray tank. For foliar spray, always add equal quantity of lime to neutralize acidity.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Zinc_sulfate.jpg/640px-Zinc_sulfate.jpg',
    usageGuide: {
      bestTime: 'Soil application: last ploughing before sowing. Foliar: at 20–25 DAS when deficiency symptoms appear.',
      pestsTargeted: ['Zinc deficiency (Khaira in Paddy)', 'Zinc chlorosis in Citrus', 'Stunted growth in Wheat', 'Sulphur deficiency (yellowing)'],
      preparationSteps: [
        { step: 1, title: 'Identify Deficiency', detail: 'Paddy Khaira: reddish-brown patches on lower leaves, plants stunted, 2–3 weeks after transplanting. Citrus: small leaves, mottled yellowing between veins.' },
        { step: 2, title: 'Soil Application Method', detail: 'Apply 10–25 kg per acre by broadcasting. Incorporate with last ploughing. Works best in acidic to neutral pH soils.' },
        { step: 3, title: 'Foliar Spray Method', detail: 'Dissolve 5g ZnSO4 in 1L warm water first, then add 2g hydrated lime to neutralize acidity. Make 1L concentrate, add to 10L water in tank. Final concentration: 0.5% ZnSO4.' },
        { step: 4, title: 'Spray Lower Leaves', detail: 'Spray lower and mid canopy where Khaira symptoms appear. Two sprays at 7-day interval usually corrects moderate deficiency.' },
        { step: 5, title: 'Long-term Soil Build-up', detail: 'Apply soil zinc once every 3 years in severely deficient soils. Annual foliar spray for maintenance. Soil organic matter improves zinc availability.' }
      ],
      warningNote: 'Zinc foliar spray WITHOUT lime addition causes leaf burn. Always neutralize with equal weight of lime. Do not mix with DAP or superphosphate — precipitates form.',
      phiDays: 0,
      reentryHours: 1
    },
    reviews: [
      { id: 'rzs1', farmerName: 'Pramod Yadav', location: 'Varanasi, UP', rating: 5, date: '2 weeks ago', comment: 'Khaira disease in paddy every year until I started soil application of Zinc Sulphate before transplanting. Problem completely solved. Yield up by 15%.', cropGrown: 'Paddy', verified: true }
    ]
  },
  {
    id: 'calcium-nitrate-19',
    name: 'Calcium Nitrate 19% N + 23% Ca — Fruit Quality Booster',
    brand: 'Haifa CalciNit',
    type: 'Calcium-nitrogen fertilizer',
    category: 'Fertilizer',
    crop: 'Tomato, Potato, Apple, Grape, Capsicum, Banana',
    price: 549,
    originalPrice: 749,
    unit: '5 kg',
    badge: 'Blossom End Rot Cure',
    tone: 'bg-sky-100 text-sky-800 border-sky-300',
    rating: 4.8,
    reviewCount: 870,
    inStock: true,
    stockCount: 20,
    deliveryDays: 'Tomorrow by 1 PM',
    seller: 'Haifa Auth. Dealer',
    composition: 'Calcium Nitrate Ca(NO3)2 — Ca 23%, Nitrogen (Nitrate-N) 19%',
    dosagePerAcre: '5–10 kg per acre via drip irrigation or 1–2 g/L foliar spray',
    applicationMethod: 'Drip irrigation fertigation or foliar spray at fruit development stage',
    suitableCrops: ['Tomato', 'Potato', 'Apple', 'Grapes', 'Capsicum', 'Banana', 'Strawberry', 'Mango'],
    description: 'Premium water-soluble calcium nitrate fertilizer that simultaneously corrects calcium deficiency and provides readily available nitrate nitrogen. Essential for preventing Blossom End Rot in tomato/capsicum and bitter pit in apple.',
    features: [
      'Prevents Blossom End Rot (BER) — #1 cause of tomato fruit loss',
      'Provides 23% readily available calcium for cell wall strength',
      'Nitrate-N form immediately available to plants (no conversion needed)',
      'Reduces tip burn in lettuce and inner browning in cabbage',
      '100% water soluble for drip fertigation systems'
    ],
    safetyAdvice: 'Do not mix with phosphate fertilizers, sulfates, or alkaline compounds in same tank — precipitates form. Apply through separate drip injection.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Calcium_nitrate.jpg/640px-Calcium_nitrate.jpg',
    usageGuide: {
      bestTime: 'Apply every 7–10 days during fruit development/expansion phase. Critical period is fruit sizing after fruit set.',
      pestsTargeted: ['Blossom End Rot (BER) in Tomato/Capsicum', 'Bitter Pit in Apple', 'Calcium deficiency in fruit crops', 'Tip burn in Lettuce/Cabbage'],
      preparationSteps: [
        { step: 1, title: 'Prevent Before Symptoms', detail: 'BER prevention: start Calcium Nitrate spray at first fruit set. Once BER appears, fruit cannot recover — only new fruits can be protected.' },
        { step: 2, title: 'Prepare Drip Solution', detail: 'For drip: dissolve 5–10 kg in water, filter, and inject via Venturi injector. NEVER mix with phosphate fertilizers in same tank.' },
        { step: 3, title: 'Foliar Spray Method', detail: 'Dissolve 1–2g per litre for foliar. Spray to runoff on leaves and developing fruit. Evening spray preferred — calcium absorbed through young tissue.' },
        { step: 4, title: 'Maintain Soil Moisture', detail: 'Calcium moves in plants via transpiration stream. Erratic watering stops Ca movement. Maintain consistent soil moisture for calcium to work.' },
        { step: 5, title: 'Repeat Weekly', detail: 'Apply every 7 days during rapid fruit growth phase. Combine with regular drip fertigation schedule for best results.' }
      ],
      warningNote: 'NEVER mix Calcium Nitrate with phosphate or sulfate fertilizers in same tank — heavy precipitate forms and blocks drip emitters. Run in separate injection cycle.',
      phiDays: 0,
      reentryHours: 1
    },
    reviews: [
      { id: 'rcn1', farmerName: 'Santosh Bhosale', location: 'Nashik, Maharashtra', rating: 5, date: '4 days ago', comment: 'BER was causing 30% tomato fruit loss. Started weekly CalciNit drip injection at fruit set stage. BER dropped to less than 2% in the next flush. Life-saving product.', cropGrown: 'Tomato', verified: true }
    ]
  },
  {
    id: 'borax-20',
    name: 'Borax 20% (Sodium Tetraborate) — Boron Fertilizer',
    brand: 'Kisan Ratna Boron',
    type: 'Boron micronutrient fertilizer',
    category: 'Micronutrient',
    crop: 'Onion, Groundnut, Sunflower, Cotton, Rapeseed',
    price: 199,
    originalPrice: 279,
    unit: '2 kg',
    badge: 'Hollow Stem Preventer',
    tone: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    rating: 4.6,
    reviewCount: 620,
    inStock: true,
    stockCount: 35,
    deliveryDays: 'Tomorrow by 3 PM',
    seller: 'Kisan Krishi Kendra (Govt Authorized)',
    composition: 'Sodium Tetraborate (Borax) — Boron 10.5% water soluble',
    dosagePerAcre: 'Soil: 2–3 kg per acre; Foliar: 0.5–1g/L (2–3 sprays)',
    applicationMethod: 'Soil broadcasting before sowing or foliar spray at flowering stage',
    suitableCrops: ['Onion', 'Groundnut', 'Sunflower', 'Cotton', 'Rapeseed/Mustard', 'Cauliflower', 'Apple', 'Sugarcane'],
    description: 'Boron micronutrient fertilizer for crops prone to boron deficiency. Corrects hollow stem in cauliflower, poor pod setting in groundnut/mustard, and empty bolls in cotton caused by boron deficiency affecting pollen germination.',
    features: [
      'Prevents hollow stem in cauliflower and broccoli',
      'Essential for pollen germination and fruit/seed setting',
      'Corrects empty pods in groundnut and poor curd formation in cauliflower',
      'Improves boll setting and lint development in cotton',
      'Low dose requirement — small quantity covers entire acre'
    ],
    safetyAdvice: 'Very narrow margin between deficiency and toxicity. NEVER exceed recommended dose. Phytotoxicity occurs at >3g/L foliar concentration.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Borax_crystals_2.jpg/640px-Borax_crystals_2.jpg',
    usageGuide: {
      bestTime: 'Apply at pre-flowering or early flowering stage — boron is essential for pollen viability and fertilization',
      pestsTargeted: ['Boron deficiency', 'Hollow stem in Cauliflower', 'Empty pods in Groundnut', 'Poor setting in Mustard/Cotton', 'Internal browning in Beet'],
      preparationSteps: [
        { step: 1, title: 'Deficiency Symptoms', detail: 'Boron deficiency: growing tip dies (blindness), misshapen young leaves, hollow center in cauliflower curd, poor pod set. Sandy, acidic soils are most deficient.' },
        { step: 2, title: 'Precise Dose Only', detail: 'Borax has narrow safe range. Measure EXACTLY: 0.5–1g per litre for foliar. Never exceed 1g/L — phytotoxicity causes leaf scorching.' },
        { step: 3, title: 'Soil Application', detail: 'Mix 2–3 kg borax with sand and broadcast before last ploughing. Incorporate thoroughly. One soil application lasts 2–3 seasons.' },
        { step: 4, title: 'Pre-flower Spray', detail: 'Apply foliar spray at bud initiation stage (before flowers open). Boron enables pollen tube growth — must be present AT pollination.' },
        { step: 5, title: 'Two-Spray Protocol', detail: 'First spray at pre-flower stage. Second spray after 15 days at early pod formation. Never apply more than 3 sprays per season.' }
      ],
      warningNote: '⚠️ EXCESS BORON IS PHYTOTOXIC. Do not exceed 1g/L foliar OR 3 kg/acre soil. Boron toxicity causes leaf tip burn, poor germination, and reduced yield. Less is more.',
      phiDays: 0,
      reentryHours: 1
    },
    reviews: [
      { id: 'rbr1', farmerName: 'Mahesh Naik', location: 'Sangli, Maharashtra', rating: 5, date: '3 weeks ago', comment: 'Hollow stem in cauliflower was my biggest problem. Applied borax at curd initiation stage. Near zero hollow stem this season. Simple and effective.', cropGrown: 'Cauliflower', verified: true }
    ]
  }
]

export const DISCOUNT_COUPONS: Record<string, { discountPercent: number; maxDiscount: number; description: string }> = {
  KISAN10: {
    discountPercent: 10,
    maxDiscount: 250,
    description: '10% Extra Farmers Discount on all fertilizers & bio inputs'
  },
  FERTILE20: {
    discountPercent: 20,
    maxDiscount: 400,
    description: '20% Mega Agri-Season Discount'
  },
  GREENFARM: {
    discountPercent: 15,
    maxDiscount: 300,
    description: '15% Organic Care & Soil amendment Special'
  }
}

export const SAMPLE_FARM_ADDRESSES = [
  {
    id: 'addr-1',
    isDefault: true,
    fullName: 'Ramesh Patil',
    phone: '+91 98220 12345',
    addressType: 'Farm Gate / Land',
    street: 'Farm Plot No. 14, Gat 204, Near Canal Siphon',
    village: 'Baramati Rural, Post Malegaon',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '413115',
    instructions: 'Drive tractor road beside primary school. Call 30 mins before arrival.'
  },
  {
    id: 'addr-2',
    isDefault: false,
    fullName: 'Ramesh Patil',
    phone: '+91 98220 12345',
    addressType: 'Village Home / Kendra',
    street: 'House No. 42, Bazar Galli, Near Gram Panchayat',
    village: 'Baramati Town',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '413102',
    instructions: 'Delivery accepted between 8 AM to 8 PM.'
  }
]

// Crop to pesticide/fertilizer mapping for "Shop by Crop" feature
export const CROP_PRODUCT_MAP: Record<string, string[]> = {
  'Chilli': ['neem-shield', 'acephate-75sp', 'imidacloprid-17sl', 'spinosad-45sc', 'beauveria-bassiana', 'mancozeb-75wp', 'npk-191919', 'chelated-micronutrient'],
  'Red Gram': ['chlorpyrifos-20ec', 'lambda-cyhalothrin-5ec', 'emamectin-benzoate-5sg', 'bacillus-thuringiensis', 'trichoderma-guard', 'npk-191919'],
  'Green Gram': ['chlorpyrifos-20ec', 'carbendazim-50wp', 'neem-shield', 'chelated-micronutrient', 'npk-191919'],
  'Tomato': ['imidacloprid-17sl', 'emamectin-benzoate-5sg', 'mancozeb-75wp', 'propiconazole-25ec', 'bacillus-thuringiensis', 'calcium-nitrate-19', 'npk-191919'],
  'Cotton': ['profenofos-50ec', 'chlorpyrifos-20ec', 'lambda-cyhalothrin-5ec', 'neem-shield', 'beauveria-bassiana', 'spinosad-45sc', 'mop-potash'],
  'Paddy': ['imidacloprid-17sl', 'carbendazim-50wp', 'propiconazole-25ec', 'urea-46', 'dap-1846', 'zinc-sulphate-33', 'npk-191919'],
  'Wheat': ['lambda-cyhalothrin-5ec', 'carbendazim-50wp', 'propiconazole-25ec', 'urea-46', 'dap-1846'],
  'Potato': ['metalaxyl-mancozeb', 'mancozeb-75wp', 'mop-potash', 'calcium-nitrate-19', 'borax-20'],
  'Onion': ['mancozeb-75wp', 'metalaxyl-mancozeb', 'mop-potash', 'borax-20', 'urea-46'],
  'Banana': ['carbendazim-50wp', 'calcium-nitrate-19', 'mop-potash', 'propiconazole-25ec', 'neem-shield'],
  'Ginger': ['metalaxyl-mancozeb', 'trichoderma-guard', 'mancozeb-75wp', 'enriched-compost'],
  'Groundnut': ['chlorpyrifos-20ec', 'mancozeb-75wp', 'beauveria-bassiana', 'borax-20', 'gypsum'],
  'Sugarcane': ['mop-potash', 'urea-46', 'imidacloprid-17sl', 'trichoderma-guard'],
  'Maize': ['lambda-cyhalothrin-5ec', 'urea-46', 'dap-1846', 'zinc-sulphate-33'],
  'Cabbage': ['emamectin-benzoate-5sg', 'bacillus-thuringiensis', 'mancozeb-75wp', 'yellow-sticky-traps']
}
