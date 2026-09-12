export type CropCategory = 'pulses' | 'spices' | 'vegetables' | 'fruits' | 'grains' | 'cash_crops' | 'oilseeds'

export type CropDefinition = {
  id: string
  name: string
  hindiName: string
  category: CropCategory
  varieties: string[]
  commonUnit: 'Quintal (100 kg)' | 'Kg' | 'Metric Ton (1000 kg)' | 'Crates (20-25 kg)' | 'Bags (50 kg)'
  avgMandiPricePerUnit: number
  mspPricePerUnit?: number
  unitLabel: string
  harvestSeasons: string[]
  qualityGrades: {
    grade: string
    description: string
    specs: string
  }[]
  iconEmoji: string
  imageUrl: string
  storageAdvice: string
}

export const CROP_CATEGORIES: { id: CropCategory; label: string; icon: string; description: string }[] = [
  { id: 'pulses', label: 'Pulses & Dal', icon: '🫘', description: 'Red Gram (Tur), Green Gram (Moong), Black Gram (Urad), Chana' },
  { id: 'spices', label: 'Spices & Condiments', icon: '🌶️', description: 'Dry Red Chilli, Green Chilli, Turmeric, Ginger, Garlic' },
  { id: 'vegetables', label: 'Fresh Vegetables', icon: '🍅', description: 'Tomato, Onion, Potato, Brinjal, Okra, Capsicum, Green Peas' },
  { id: 'fruits', label: 'Orchard Fruits', icon: '🥭', description: 'Mango, Banana, Pomegranate, Grapes, Papaya, Orange, Guava' },
  { id: 'grains', label: 'Food Grains & Millets', icon: '🌾', description: 'Wheat, Basmati/Non-Basmati Paddy, Maize, Jowar, Bajra, Ragi' },
  { id: 'cash_crops', label: 'Cash & Commercial Crops', icon: '🌱', description: 'Cotton, Sugarcane, Tobacco, Jute' },
  { id: 'oilseeds', label: 'Oilseeds', icon: '🌻', description: 'Soybean, Groundnut, Mustard, Sunflower, Sesame' }
]

export const CROPS_CATALOG: CropDefinition[] = [
  // PULSES (Key user request: Red Gram, Green Gram)
  {
    id: 'red-gram',
    name: 'Red Gram / Pigeon Pea (Tur / Arhar)',
    hindiName: 'तुवर दाल / अरहर',
    category: 'pulses',
    varieties: ['Maruti (ICP 8863)', 'Asha (ICPL 87119)', 'BDN 711', 'Vishakha', 'Local Desi Tur'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 7450,
    mspPricePerUnit: 7550,
    harvestSeasons: ['December', 'January', 'February'],
    qualityGrades: [
      { grade: 'Grade A (FAQ Bold)', description: 'Whole unbroken grains, uniform reddish-brown, zero weevil damage', specs: 'Moisture < 10%, foreign matter < 1%' },
      { grade: 'Grade B (Standard)', description: 'Standard quality, slightly mixed grain size', specs: 'Moisture 10-12%, foreign matter < 2%' },
      { grade: 'Grade C (Milling)', description: 'Suitable for immediate dal mill processing', specs: 'Moisture 12-14%' }
    ],
    iconEmoji: '🫘',
    imageUrl: 'https://images.unsplash.com/photo-1585314062604-1a357de8b000?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Store in dry hermetic or gunny bags with neem leaves. Keep moisture below 10% to prevent pulse beetle attack.'
  },
  {
    id: 'green-gram',
    name: 'Green Gram / Mung Bean (Moong)',
    hindiName: 'मूंग दाल',
    category: 'pulses',
    varieties: ['Vaibhav', 'BM 2003-2', 'PKV AKM-4', 'Pusa Vishal', 'SML 668'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 8200,
    mspPricePerUnit: 8558,
    harvestSeasons: ['September', 'October', 'March', 'April'],
    qualityGrades: [
      { grade: 'Grade A (Shining Green)', description: 'Lustrous deep green, bold uniform grains, premium dal grade', specs: 'Moisture < 9.5%, damaged < 0.5%' },
      { grade: 'Grade B (Commercial)', description: 'Standard green gram for trading and sprout cultivation', specs: 'Moisture 10-11%, foreign matter < 1.5%' }
    ],
    iconEmoji: '🌱',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Keep elevated on wooden pallets away from ground dampness. Moong absorbs moisture rapidly.'
  },
  {
    id: 'black-gram',
    name: 'Black Gram (Urad)',
    hindiName: 'उड़द दाल',
    category: 'pulses',
    varieties: ['TAU-1', 'TPU-4', 'AKU-15', 'Pant U-31'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 7800,
    mspPricePerUnit: 7400,
    harvestSeasons: ['October', 'November'],
    qualityGrades: [
      { grade: 'Grade A (Bold Jet Black)', description: 'Polished jet-black appearance with white hilum mark', specs: 'Moisture < 10%' },
      { grade: 'Grade B (Mandi FAQ)', description: 'Clean harvested farm grain with minimal chalkiness', specs: 'Moisture 11%' }
    ],
    iconEmoji: '🫘',
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Fumigate gunny bags before bagging. Check periodically for pulse weevil.'
  },
  {
    id: 'chickpea',
    name: 'Bengal Gram / Chickpea (Desi & Kabuli Chana)',
    hindiName: 'चना / छोले',
    category: 'pulses',
    varieties: ['Digvijay', 'Vijay', 'JAKI 9218', 'Dollar Kabuli (PKV-2)', 'KAK-2'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 5850,
    mspPricePerUnit: 5440,
    harvestSeasons: ['February', 'March', 'April'],
    qualityGrades: [
      { grade: 'Grade A (Bold 8-9mm)', description: 'Large caliber, bright golden tan, export-worthy', specs: 'Moisture < 9.5%' },
      { grade: 'Grade B (Desi Medium)', description: 'Solid grain density, ideal for besan and dal mills', specs: 'Moisture < 11%' }
    ],
    iconEmoji: '🧆',
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Sun dry thoroughly to 9% moisture before putting in warehouse silos.'
  },

  // SPICES (Key user request: Chilli)
  {
    id: 'red-chilli',
    name: 'Dry Red Chilli (Guntur & Byadagi)',
    hindiName: 'सूखी लाल मिर्च',
    category: 'spices',
    varieties: ['Guntur Teja (S-17)', 'Byadagi Kaddi', 'Byadagi Dabbi', 'Armoor / 334', 'Sannam (S4)'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 18500,
    harvestSeasons: ['January', 'February', 'March', 'April'],
    qualityGrades: [
      { grade: 'Grade A (Stemless / With Stem Deep Red)', description: 'Uniform deep scarlet color, high pungency/ASTA color value, zero mold or white spots', specs: 'Moisture < 11%, broken < 2%' },
      { grade: 'Grade B (Mandi Standard)', description: 'Good natural color, minimal seed shedding', specs: 'Moisture 11-13%, broken < 5%' },
      { grade: 'Grade C (Oleoresin Extract Grade)', description: 'Suitable for spice extraction and powder mills', specs: 'Industrial grade' }
    ],
    iconEmoji: '🌶️',
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Cold storage at 4-6°C with 60% relative humidity preserves the brilliant red color and capsaisin strength for up to 10 months.'
  },
  {
    id: 'green-chilli',
    name: 'Fresh Green Chilli',
    hindiName: 'हरी मिर्च',
    category: 'spices',
    varieties: ['G4 (Bhagirathi)', 'Sitara', 'Navtej', 'Jwalamukhi', 'Teja Fresh'],
    commonUnit: 'Kg',
    unitLabel: '₹/kg',
    avgMandiPricePerUnit: 38,
    harvestSeasons: ['Year-round', 'Peak: June-October'],
    qualityGrades: [
      { grade: 'Grade A (Crisp Export)', description: 'Uniform 7-9 cm length, crisp dark green stalk attached, no blemishes', specs: 'Field fresh, harvested morning' },
      { grade: 'Grade B (Local Mandi)', description: 'Healthy green chillies for domestic daily vegetable market', specs: 'Clean, sorted' }
    ],
    iconEmoji: '🌶️',
    imageUrl: 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Pack in ventilated plastic crates with paper lining. Dispatch within 24-36 hours of harvest.'
  },
  {
    id: 'turmeric',
    name: 'Turmeric Fingers (Curcumin Rich)',
    hindiName: 'हल्दी (साबुत गांठ)',
    category: 'spices',
    varieties: ['Waigaon (GI Tagged)', 'Salem', 'Prathiba', 'Rajapore', 'Erode'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 14200,
    harvestSeasons: ['February', 'March', 'April'],
    qualityGrades: [
      { grade: 'Grade A (Double Polished Finger)', description: 'Hard sound fingers, high curcumin (>4.5%), vibrant golden yellow core', specs: 'Moisture < 10%' },
      { grade: 'Grade B (Single Polished / Bulb)', description: 'Clean boiled and sun-dried turmeric bulbs and fingers', specs: 'Moisture < 11%' }
    ],
    iconEmoji: '🟡',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Store in dry sheds wrapped in HDPE bags. Guard against rodent intrusion.'
  },
  {
    id: 'ginger',
    name: 'Fresh Ginger (Adrak)',
    hindiName: 'ताजा अदरक',
    category: 'spices',
    varieties: ['Mahim', 'Varada', 'Rio-de-Janeiro', 'Maran'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 6500,
    harvestSeasons: ['December', 'January', 'February'],
    qualityGrades: [
      { grade: 'Grade A (Fat Rhizomes)', description: 'Fleshy, washed, plump rhizomes with thin skin and fiber-free center', specs: 'Moisture 80%' },
      { grade: 'Grade B (Commercial)', description: 'Unwashed field-dry rhizomes for bulk terminal markets', specs: 'Standard' }
    ],
    iconEmoji: '🫚',
    imageUrl: 'https://images.unsplash.com/photo-1599818493037-fe7564161d52?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Keep in cool shade pits covered with damp sand or dispatch directly.'
  },
  {
    id: 'garlic',
    name: 'Garlic Bulbs (Lahsun)',
    hindiName: 'लहसुन',
    category: 'spices',
    varieties: ['G-282', 'Yamuna Safed (G-1)', 'Bhima Purple', 'Ooty-1'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 11500,
    harvestSeasons: ['February', 'March', 'April'],
    qualityGrades: [
      { grade: 'Grade A (Extra Bold 45mm+)', description: 'Tight white silvery sheath, 12-16 cloves, export grade', specs: 'Cured & dried' },
      { grade: 'Grade B (Medium 35-45mm)', description: 'Standard consumer grade with solid clove count', specs: 'Cured' }
    ],
    iconEmoji: '🧄',
    imageUrl: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Hang in braided bunches or well-ventilated wire-mesh racks with cross airflow.'
  },

  // VEGETABLES (Key user request: All types of vegetables)
  {
    id: 'tomato',
    name: 'Fresh Tomatoes (Hybrid & Desi)',
    hindiName: 'टमाटर',
    category: 'vegetables',
    varieties: ['Shivam (Syngenta)', 'Abhinav', 'US 440', 'Vaishali', 'Pusa Ruby (Desi)'],
    commonUnit: 'Crates (20-25 kg)',
    unitLabel: '₹/Crate',
    avgMandiPricePerUnit: 480,
    harvestSeasons: ['Year-round', 'Peak: October-March'],
    qualityGrades: [
      { grade: 'Grade A (Breaker / Pink Stage)', description: 'Firm, uniform size, breaker-turning red stage ideal for 3-5 day transit', specs: 'No cracks or sun scald' },
      { grade: 'Grade B (Table Ripe)', description: 'Fully red, rich pulp, perfect for immediate retail or sauce processing', specs: 'Clean, firm' }
    ],
    iconEmoji: '🍅',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Stack crates maximum 6 high with proper vertical alignment. Never expose full-ripe tomatoes to direct sun.'
  },
  {
    id: 'onion',
    name: 'Red Onion (Nashik & Lasalgaon)',
    hindiName: 'लाल प्याज',
    category: 'vegetables',
    varieties: ['Nashik Red (Garwa)', 'Bhima Super', 'Bhima Shakti', 'Agrifound Dark Red'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 2350,
    harvestSeasons: ['March-May (Rabi/Garwa)', 'October-December (Kharif)'],
    qualityGrades: [
      { grade: 'Grade A (Patti Golta 55mm+)', description: 'Tight dry red skin, single thin neck, excellent shelf life of 4-6 months', specs: 'Neck cured dry' },
      { grade: 'Grade B (Medium Golti 40-50mm)', description: 'Clean sound bulbs for daily domestic consumption', specs: 'Dry cured' }
    ],
    iconEmoji: '🧅',
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Store in raised traditional "Kanda Chawl" with bottom and side bamboo ventilation. Avoid all humidity.'
  },
  {
    id: 'potato',
    name: 'Potatoes (Table & Processing)',
    hindiName: 'आलू',
    category: 'vegetables',
    varieties: ['Kufri Jyoti', 'Kufri Pukhraj', 'Kufri Chipsona (Chips Grade)', 'Kufri Bahar'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 1650,
    harvestSeasons: ['January', 'February', 'March'],
    qualityGrades: [
      { grade: 'Grade A (Chips / Grade 1)', description: 'Smooth oval, zero greening or scab, high dry matter (>21%)', specs: 'Size > 50mm' },
      { grade: 'Grade B (Table Potato)', description: 'Even shape, clean farm skin, no rotting', specs: 'Size 40-50mm' }
    ],
    iconEmoji: '🥔',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Keep in dark cool area to prevent solanine greening. Ideal for cold store at 8-10°C.'
  },
  {
    id: 'okra',
    name: 'Okra / Lady Finger (Bhindi)',
    hindiName: 'भिंडी',
    category: 'vegetables',
    varieties: ['Radhika', 'Singham (Nunhems)', 'Arka Anamika', 'VNR 999'],
    commonUnit: 'Kg',
    unitLabel: '₹/kg',
    avgMandiPricePerUnit: 34,
    harvestSeasons: ['March-June', 'July-November'],
    qualityGrades: [
      { grade: 'Grade A (Tender Dark Green)', description: 'Tender snap tip, 7-10 cm, vibrant dark green, zero fiber stringiness', specs: 'Harvested morning' },
      { grade: 'Grade B (Standard)', description: 'Crisp green pods for daily local wholesale', specs: 'Fresh picked' }
    ],
    iconEmoji: '🥗',
    imageUrl: 'https://images.unsplash.com/photo-1574316071802-0d684efa7cd5?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Very perishable. Pack in perforated bags or crates and dispatch to local mandi or buyer the same evening.'
  },
  {
    id: 'capsicum',
    name: 'Colored & Green Capsicum (Shimla Mirch)',
    hindiName: 'शिमला मिर्च',
    category: 'vegetables',
    varieties: ['Indra (Green)', 'Inspiration (Yellow Polyhouse)', 'Bachata (Red Polyhouse)'],
    commonUnit: 'Kg',
    unitLabel: '₹/kg',
    avgMandiPricePerUnit: 52,
    harvestSeasons: ['Year-round (Polyhouse/Protected)'],
    qualityGrades: [
      { grade: 'Grade A (Blocky 4-Lobed)', description: 'Thick glossy walls, firm 4-lobed bell shape, uniform coloring, stem attached', specs: 'Weight 150-200g each' },
      { grade: 'Grade B (Commercial)', description: 'Healthy crisp capsicum for hotels and retail chains', specs: 'Weight 100-140g' }
    ],
    iconEmoji: '🫑',
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Keep at 10-12°C. Avoid damp packing to stop botrytis mold.'
  },
  {
    id: 'green-peas',
    name: 'Green Peas in Pod (Matar)',
    hindiName: 'हरी मटर',
    category: 'vegetables',
    varieties: ['GS-10 (Golden Seed)', 'Arkel', 'AP-3', 'Matar Ageta'],
    commonUnit: 'Kg',
    unitLabel: '₹/kg',
    avgMandiPricePerUnit: 42,
    harvestSeasons: ['November', 'December', 'January', 'February'],
    qualityGrades: [
      { grade: 'Grade A (Plump Sweet)', description: 'Full sweet green pods with 8-10 sweet tender seeds inside', specs: 'Zero yellowing' }
    ],
    iconEmoji: '🫛',
    imageUrl: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Fast pre-cooling preserves natural sucrose sweetness from converting into starch.'
  },

  // FRUITS (Key user request: All types of fruits)
  {
    id: 'mango',
    name: 'Mango (Alphonso, Kesar & Banganapalli)',
    hindiName: 'आम (हापुस, केसर)',
    category: 'fruits',
    varieties: ['Ratnagiri Alphonso (Hapus)', 'Gir Kesar', 'Banganapalli', 'Dasheri', 'Totapuri'],
    commonUnit: 'Crates (20-25 kg)',
    unitLabel: '₹/Dozen or Crate',
    avgMandiPricePerUnit: 1100,
    harvestSeasons: ['March', 'April', 'May', 'June'],
    qualityGrades: [
      { grade: 'Grade A (GI Certified Export)', description: 'Naturally tree-ripened, spotless golden skin, sweet aroma, weight > 250g', specs: 'Carbide-free guaranteed' },
      { grade: 'Grade B (Semi-Ripe Table)', description: 'Firm fruit harvested with stalk, ready for 4-day transit & natural grass ripening', specs: 'Weight 200-240g' },
      { grade: 'Grade C (Pulp & Processing)', description: 'Totapuri and mixed variety for juice and mango pulp manufacturers', specs: 'Sound fruit' }
    ],
    iconEmoji: '🥭',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Ripen naturally in rice straw or wooden boxes. Never use harmful calcium carbide.'
  },
  {
    id: 'banana',
    name: 'Tissue Culture Banana (Grand Naine)',
    hindiName: 'केला (G-9)',
    category: 'fruits',
    varieties: ['Grand Naine (G-9)', 'Robusta', 'Yelakki / Sugandhi', 'Nendran (Kerala)'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 1650,
    harvestSeasons: ['Year-round'],
    qualityGrades: [
      { grade: 'Grade A (Export Bunch Hands)', description: 'Clean blemish-free fingers, uniform length > 18cm, 39-44 caliber', specs: 'Ethylene ripening ready' },
      { grade: 'Grade B (Domestic Wholesale)', description: 'Healthy bunches with 8-10 hands per bunch', specs: 'Sound green fruit' }
    ],
    iconEmoji: '🍌',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Transport in refrigerated vans at 13.5°C to avoid chilling injury.'
  },
  {
    id: 'pomegranate',
    name: 'Pomegranate (Bhagwa Deep Red)',
    hindiName: 'अनार (भगवा)',
    category: 'fruits',
    varieties: ['Bhagwa (Solapur GI)', 'Arakta', 'Ganesh'],
    commonUnit: 'Kg',
    unitLabel: '₹/kg',
    avgMandiPricePerUnit: 95,
    harvestSeasons: ['Ambe Bahar (July-Sept)', 'Mrig Bahar (Nov-Feb)', 'Hasta Bahar'],
    qualityGrades: [
      { grade: 'Grade A (Export Supreme 350g+)', description: 'Lustrous ruby-red arils, soft edible seeds, high Brix (>16°), glossy skin', specs: 'Weight > 350g each' },
      { grade: 'Grade B (Super 250-350g)', description: 'Uniform red coloring, delicious sweet-sour juice balance', specs: 'Weight 250-350g' }
    ],
    iconEmoji: '🍎',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Store at 5°C with 90% humidity. Can retain freshness for 2-3 months.'
  },
  {
    id: 'grapes',
    name: 'Table Grapes (Thompson Seedless & Sonaka)',
    hindiName: 'अंगूर (नाशिक स्पेशल)',
    category: 'fruits',
    varieties: ['Thompson Seedless', 'Sonaka', 'Sharad Seedless (Black)', 'Crimson Seedless (Red)'],
    commonUnit: 'Kg',
    unitLabel: '₹/kg',
    avgMandiPricePerUnit: 68,
    harvestSeasons: ['January', 'February', 'March', 'April'],
    qualityGrades: [
      { grade: 'Grade A (Export Cluster)', description: 'Amber green berries with natural waxy bloom, Brix 18°+, berry diameter 16mm+', specs: 'Zero berry drop' },
      { grade: 'Grade B (Domestic Table)', description: 'Crisp sweet clusters for metro city distribution', specs: 'Sorted & trimmed' }
    ],
    iconEmoji: '🍇',
    imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Pack with sulfur dioxide generator pads and cool immediately to 0-1°C.'
  },
  {
    id: 'papaya',
    name: 'Taiwan Red Lady 786 Papaya',
    hindiName: 'पपीता (रेड लेडी)',
    category: 'fruits',
    varieties: ['Taiwan Red Lady 786', 'Pusa Delicious', 'Coorg Honey'],
    commonUnit: 'Kg',
    unitLabel: '₹/kg',
    avgMandiPricePerUnit: 24,
    harvestSeasons: ['Year-round'],
    qualityGrades: [
      { grade: 'Grade A (Sweet Red Flesh)', description: 'Deep red flesh, small seed cavity, sweet Brix 13°+, single fruit weight 1.5-2.2kg', specs: 'Harvested color break' }
    ],
    iconEmoji: '🍈',
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Cushion with foam netting. Keep away from extreme chill.'
  },

  // GRAINS & MILLETS
  {
    id: 'wheat',
    name: 'Wheat Grain (Sharbati & Lokwan)',
    hindiName: 'गेहूं (शरबती / लोकवन)',
    category: 'grains',
    varieties: ['MP Sharbati (Golden)', 'Lokwan (C-306)', 'GW 496', 'HD 2967', 'PBW 343'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 2850,
    mspPricePerUnit: 2275,
    harvestSeasons: ['March', 'April', 'May'],
    qualityGrades: [
      { grade: 'Grade A (Sharbati Premium Gold)', description: 'Heavy golden grain luster, high protein (>12.5%), exceptional chappati softness', specs: 'Moisture < 10%' },
      { grade: 'Grade B (Mandi Mill Quality)', description: 'Clean plump grains for commercial roller flour mills (Chakki Atta)', specs: 'Moisture < 11.5%' }
    ],
    iconEmoji: '🌾',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Store in WDRA certified warehouses with e-NWR pledge financing eligibility.'
  },
  {
    id: 'paddy-rice',
    name: 'Paddy / Basmati & Sona Masoori Rice',
    hindiName: 'धान / चावल (बासमती, कोलम)',
    category: 'grains',
    varieties: ['Pusa Basmati 1121', 'Pusa 1509', 'Sona Masoori', 'Wada Kolam (GI)', 'Indrayani'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 3650,
    mspPricePerUnit: 2300,
    harvestSeasons: ['October', 'November', 'December'],
    qualityGrades: [
      { grade: 'Grade A (Basmati Long Grain 8.3mm)', description: 'Aromatic extra long slender grain with 2.5x cooked elongation ratio', specs: 'Moisture < 13%' },
      { grade: 'Grade B (Common / Sona Masoori)', description: 'Medium slender clean paddy, high head rice recovery (>55%)', specs: 'Moisture < 14%' }
    ],
    iconEmoji: '🍚',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Aerated silos or gunny bag godowns. Ageing enhances aroma and grain cooking separation.'
  },
  {
    id: 'maize',
    name: 'Yellow Maize / Corn (Poultry & Starch Grade)',
    hindiName: 'मक्का (मकई)',
    category: 'grains',
    varieties: ['Pioneer P3396', 'NK 6240', 'Dekalb 9108', 'Sweet Corn (Sugar-75)'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 2200,
    mspPricePerUnit: 2090,
    harvestSeasons: ['September-October (Kharif)', 'March-April (Rabi)'],
    qualityGrades: [
      { grade: 'Grade A (Starch / Feed Grade)', description: 'Bright uniform golden kernels, aflatoxin < 20 ppb, moisture < 12%', specs: 'Foreign matter < 1%' }
    ],
    iconEmoji: '🌽',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Sun dry on tarpaulin immediately. High moisture causes fatal aflatoxin fungus in corn.'
  },

  // CASH & COMMERCIAL CROPS
  {
    id: 'cotton',
    name: 'Raw Cotton / Kapas (Long Staple)',
    hindiName: 'कपास (सफेद सोना)',
    category: 'cash_crops',
    varieties: ['Bt Cotton (Bollgard II)', 'Shankar-6 (Gujarat)', 'DCH-32', 'RCH 2', 'Bunny'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 7400,
    mspPricePerUnit: 7121,
    harvestSeasons: ['October', 'November', 'December', 'January'],
    qualityGrades: [
      { grade: 'Grade A (Long Staple 29.5mm+)', description: 'Pure white fluffy bolls, zero trash/leaf contamination, high ginning outturn (>35%)', specs: 'Moisture < 8.5%' },
      { grade: 'Grade B (Medium Staple 26-28mm)', description: 'Clean farm picked kapas for spinning mills', specs: 'Moisture < 9.5%' }
    ],
    iconEmoji: '☁️',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Store indoors on concrete platform. Never allow rain or moisture to discolour lint or cause yellowing.'
  },
  {
    id: 'soybean',
    name: 'Soybean (Yellow Seed Oil Grade)',
    hindiName: 'सोयाबीन',
    category: 'oilseeds',
    varieties: ['JS 335', 'JS 9560', 'JS 20-34', 'NRC 37', 'KDS 726 (Phule Sangam)'],
    commonUnit: 'Quintal (100 kg)',
    unitLabel: '₹/Quintal',
    avgMandiPricePerUnit: 4850,
    mspPricePerUnit: 4892,
    harvestSeasons: ['September', 'October', 'November'],
    qualityGrades: [
      { grade: 'Grade A (Seed Grade 18%+ Oil)', description: 'Round bold yellow grains with black hilum, zero green immature seeds', specs: 'Moisture < 10%' },
      { grade: 'Grade B (Solvent Extraction FAQ)', description: 'Clean harvested soybean for crushing plants', specs: 'Moisture 10-12%' }
    ],
    iconEmoji: '🌱',
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop&q=80',
    storageAdvice: 'Keep below 10% moisture to prevent mold and rancidity in vegetable oil.'
  }
]

export function getCropById(id: string): CropDefinition | undefined {
  return CROPS_CATALOG.find((c) => c.id === id)
}

export function getCropsByCategory(category: CropCategory): CropDefinition[] {
  return CROPS_CATALOG.filter((c) => c.category === category)
}
