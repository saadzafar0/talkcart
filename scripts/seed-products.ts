/**
 * Seed script: Inserts categories + 35 mock products + variants + embeddings
 * Usage:  npx tsx scripts/seed-products.ts
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getGemini() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
}

async function generateEmbedding(text: string): Promise<number[]> {
  const ai = getGemini();
  const res = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return res.embeddings?.[0]?.values ?? [];
}

// ── Categories ───────────────────────────────────────────────
const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Smartphones, laptops, audio, and accessories' },
  { name: 'Clothing', slug: 'clothing', description: 'Men\'s and women\'s fashion apparel' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Furniture, decor, kitchen appliances and tools' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Fitness gear, outdoor equipment, and sportswear' },
  { name: 'Books & Stationery', slug: 'books-stationery', description: 'Books, notebooks, pens, and office supplies' },
  { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', description: 'Skincare, haircare, fragrances, and grooming' },
];

// ── Products (35 items) ──────────────────────────────────────
interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  base_price: number;
  minimum_price: number;
  cost_price: number;
  image_url: string;
  stock_quantity: number;
  rating: number;
  review_count: number;
  metadata: Record<string, unknown>;
  variants?: { sku: string; color?: string; size?: string; stock_quantity: number; price_adjustment: number }[];
}

const products: SeedProduct[] = [
  // ── Electronics (7) ──
  {
    name: 'ProMax Wireless Earbuds',
    slug: 'promax-wireless-earbuds',
    description: 'Noise-cancelling true wireless earbuds with 30-hour battery life, IPX5 water resistance, and crystal-clear audio. Features adaptive EQ and seamless Bluetooth 5.3 connectivity.',
    categorySlug: 'electronics',
    base_price: 79.99, minimum_price: 55.00, cost_price: 32.00,
    image_url: 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=400&h=400&fit=crop',
    stock_quantity: 150, rating: 4.6, review_count: 234,
    metadata: { brand: 'ProMax', connectivity: 'Bluetooth 5.3', battery_life: '30 hours' },
    variants: [
      { sku: 'PME-BLK', color: 'Black', stock_quantity: 60, price_adjustment: 0 },
      { sku: 'PME-WHT', color: 'White', stock_quantity: 50, price_adjustment: 0 },
      { sku: 'PME-NVY', color: 'Navy Blue', stock_quantity: 40, price_adjustment: 5 },
    ],
  },
  {
    name: 'UltraSlim Laptop 15"',
    slug: 'ultraslim-laptop-15',
    description: 'Lightweight 15-inch laptop with M3 chip, 16GB RAM, 512GB SSD, Retina display, and up to 18 hours of battery. Perfect for professionals and creators.',
    categorySlug: 'electronics',
    base_price: 1299.99, minimum_price: 1100.00, cost_price: 850.00,
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
    stock_quantity: 45, rating: 4.8, review_count: 189,
    metadata: { brand: 'TechNova', processor: 'M3 Chip', ram: '16GB', storage: '512GB SSD' },
  },
  {
    name: 'SmartWatch Series X',
    slug: 'smartwatch-series-x',
    description: 'Advanced fitness smartwatch with AMOLED display, heart rate monitoring, GPS tracking, 7-day battery, and 100+ workout modes. Water resistant to 50m.',
    categorySlug: 'electronics',
    base_price: 249.99, minimum_price: 180.00, cost_price: 120.00,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    stock_quantity: 80, rating: 4.5, review_count: 312,
    metadata: { brand: 'FitPulse', display: 'AMOLED', water_resistance: '50m' },
    variants: [
      { sku: 'SWX-42B', size: '42mm', color: 'Black', stock_quantity: 30, price_adjustment: 0 },
      { sku: 'SWX-46S', size: '46mm', color: 'Silver', stock_quantity: 25, price_adjustment: 30 },
      { sku: 'SWX-46G', size: '46mm', color: 'Gold', stock_quantity: 25, price_adjustment: 50 },
    ],
  },
  {
    name: 'Portable Bluetooth Speaker',
    slug: 'portable-bluetooth-speaker',
    description: 'Rugged portable speaker with 360° sound, deep bass, 20-hour battery, and IP67 waterproof rating. Pairs with up to 3 devices simultaneously.',
    categorySlug: 'electronics',
    base_price: 59.99, minimum_price: 40.00, cost_price: 22.00,
    image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
    stock_quantity: 200, rating: 4.4, review_count: 567,
    metadata: { brand: 'SoundWave', waterproof: 'IP67', battery_life: '20 hours' },
  },
  {
    name: '4K Webcam Pro',
    slug: '4k-webcam-pro',
    description: 'Ultra HD 4K webcam with autofocus, built-in ring light, noise-cancelling microphone, and privacy shutter. Ideal for streaming and video calls.',
    categorySlug: 'electronics',
    base_price: 129.99, minimum_price: 90.00, cost_price: 55.00,
    image_url: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=400&fit=crop',
    stock_quantity: 90, rating: 4.3, review_count: 145,
    metadata: { brand: 'ClearView', resolution: '4K', feature: 'ring light + privacy shutter' },
  },
  {
    name: 'Wireless Charging Pad',
    slug: 'wireless-charging-pad',
    description: 'Slim 15W Qi wireless charging pad compatible with all Qi-enabled devices. LED indicator, foreign object detection, and anti-slip surface.',
    categorySlug: 'electronics',
    base_price: 29.99, minimum_price: 18.00, cost_price: 9.00,
    image_url: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&h=400&fit=crop',
    stock_quantity: 300, rating: 4.2, review_count: 421,
    metadata: { brand: 'ChargeMate', wattage: '15W', standard: 'Qi' },
  },
  {
    name: 'Mechanical Gaming Keyboard',
    slug: 'mechanical-gaming-keyboard',
    description: 'RGB mechanical keyboard with hot-swappable switches, aluminum frame, programmable macros, and wrist rest. Cherry MX-compatible, N-key rollover.',
    categorySlug: 'electronics',
    base_price: 109.99, minimum_price: 80.00, cost_price: 48.00,
    image_url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop',
    stock_quantity: 120, rating: 4.7, review_count: 278,
    metadata: { brand: 'KeyForge', switch_type: 'Hot-swappable', lighting: 'RGB' },
  },

  // ── Clothing (7) ──
  {
    name: 'Classic Cotton Oxford Shirt',
    slug: 'classic-cotton-oxford-shirt',
    description: 'Timeless button-down Oxford shirt made from 100% premium cotton. Relaxed fit, breathable fabric, reinforced stitching. Available in multiple colors and sizes.',
    categorySlug: 'clothing',
    base_price: 49.99, minimum_price: 30.00, cost_price: 15.00,
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
    stock_quantity: 250, rating: 4.4, review_count: 198,
    metadata: { brand: 'Heritage Co.', material: '100% Cotton', fit: 'Relaxed' },
    variants: [
      { sku: 'OXF-WHT-M', color: 'White', size: 'M', stock_quantity: 40, price_adjustment: 0 },
      { sku: 'OXF-BLU-M', color: 'Light Blue', size: 'M', stock_quantity: 35, price_adjustment: 0 },
      { sku: 'OXF-WHT-L', color: 'White', size: 'L', stock_quantity: 40, price_adjustment: 0 },
      { sku: 'OXF-BLU-L', color: 'Light Blue', size: 'L', stock_quantity: 35, price_adjustment: 0 },
    ],
  },
  {
    name: 'Slim-Fit Chino Pants',
    slug: 'slim-fit-chino-pants',
    description: 'Modern slim-fit chinos with stretch fabric for all-day comfort. Wrinkle-resistant, machine washable, and versatile enough for work or weekend.',
    categorySlug: 'clothing',
    base_price: 59.99, minimum_price: 35.00, cost_price: 18.00,
    image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop',
    stock_quantity: 180, rating: 4.3, review_count: 156,
    metadata: { brand: 'UrbanEdge', material: 'Cotton-Spandex Blend', fit: 'Slim' },
    variants: [
      { sku: 'CHN-KHK-32', color: 'Khaki', size: '32', stock_quantity: 45, price_adjustment: 0 },
      { sku: 'CHN-NVY-32', color: 'Navy', size: '32', stock_quantity: 45, price_adjustment: 0 },
      { sku: 'CHN-KHK-34', color: 'Khaki', size: '34', stock_quantity: 45, price_adjustment: 0 },
      { sku: 'CHN-NVY-34', color: 'Navy', size: '34', stock_quantity: 45, price_adjustment: 0 },
    ],
  },
  {
    name: 'Women\'s Cashmere Sweater',
    slug: 'womens-cashmere-sweater',
    description: 'Luxuriously soft cashmere crewneck sweater. Lightweight yet warm, ribbed cuffs and hem, perfect for layering in cooler weather.',
    categorySlug: 'clothing',
    base_price: 129.99, minimum_price: 85.00, cost_price: 50.00,
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    stock_quantity: 100, rating: 4.7, review_count: 89,
    metadata: { brand: 'Luxe Knits', material: '100% Cashmere', fit: 'Regular' },
    variants: [
      { sku: 'CSW-CRM-S', color: 'Cream', size: 'S', stock_quantity: 25, price_adjustment: 0 },
      { sku: 'CSW-BLK-S', color: 'Black', size: 'S', stock_quantity: 25, price_adjustment: 0 },
      { sku: 'CSW-CRM-M', color: 'Cream', size: 'M', stock_quantity: 25, price_adjustment: 0 },
      { sku: 'CSW-BLK-M', color: 'Black', size: 'M', stock_quantity: 25, price_adjustment: 0 },
    ],
  },
  {
    name: 'Waterproof Hiking Jacket',
    slug: 'waterproof-hiking-jacket',
    description: 'Lightweight, fully waterproof jacket with sealed seams, adjustable hood, and ventilation zips. Packs into its own pocket for easy travel.',
    categorySlug: 'clothing',
    base_price: 89.99, minimum_price: 60.00, cost_price: 35.00,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
    stock_quantity: 130, rating: 4.5, review_count: 210,
    metadata: { brand: 'TrailBlaze', material: 'Ripstop Nylon', waterproof_rating: '10,000mm' },
    variants: [
      { sku: 'HJK-GRN-M', color: 'Forest Green', size: 'M', stock_quantity: 35, price_adjustment: 0 },
      { sku: 'HJK-BLK-M', color: 'Black', size: 'M', stock_quantity: 30, price_adjustment: 0 },
      { sku: 'HJK-GRN-L', color: 'Forest Green', size: 'L', stock_quantity: 35, price_adjustment: 0 },
      { sku: 'HJK-BLK-L', color: 'Black', size: 'L', stock_quantity: 30, price_adjustment: 0 },
    ],
  },
  {
    name: 'Vintage Denim Jacket',
    slug: 'vintage-denim-jacket',
    description: 'Classic washed denim jacket with a vintage look. 100% cotton denim, button front, chest pockets, adjustable waist tabs. A wardrobe essential.',
    categorySlug: 'clothing',
    base_price: 74.99, minimum_price: 50.00, cost_price: 28.00,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
    stock_quantity: 95, rating: 4.6, review_count: 175,
    metadata: { brand: 'RetroThread', material: '100% Cotton Denim', style: 'Vintage Wash' },
  },
  {
    name: 'Performance Running Shoes',
    slug: 'performance-running-shoes',
    description: 'Lightweight running shoes with responsive foam cushioning, breathable mesh upper, and durable rubber outsole. Engineered for long-distance comfort.',
    categorySlug: 'clothing',
    base_price: 119.99, minimum_price: 85.00, cost_price: 45.00,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    stock_quantity: 160, rating: 4.5, review_count: 320,
    metadata: { brand: 'StridePro', material: 'Mesh + Foam', drop: '8mm' },
    variants: [
      { sku: 'RUN-BLK-10', color: 'Black', size: '10', stock_quantity: 40, price_adjustment: 0 },
      { sku: 'RUN-WHT-10', color: 'White', size: '10', stock_quantity: 40, price_adjustment: 0 },
      { sku: 'RUN-BLK-11', color: 'Black', size: '11', stock_quantity: 40, price_adjustment: 0 },
      { sku: 'RUN-WHT-11', color: 'White', size: '11', stock_quantity: 40, price_adjustment: 0 },
    ],
  },
  {
    name: 'Organic Cotton T-Shirt',
    slug: 'organic-cotton-tshirt',
    description: 'Soft and sustainable organic cotton t-shirt with a classic crew neck. Pre-shrunk, tagless comfort, and ethically made. Available in 6 earthy tones.',
    categorySlug: 'clothing',
    base_price: 24.99, minimum_price: 15.00, cost_price: 8.00,
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    stock_quantity: 400, rating: 4.3, review_count: 512,
    metadata: { brand: 'EcoWear', material: 'Organic Cotton', certification: 'GOTS Certified' },
  },

  // ── Home & Kitchen (6) ──
  {
    name: 'Artisan Ceramic Mug Set',
    slug: 'artisan-ceramic-mug-set',
    description: 'Set of 4 hand-glazed ceramic mugs, 12oz each. Microwave and dishwasher safe. Unique reactive glaze finish – no two mugs are exactly alike.',
    categorySlug: 'home-kitchen',
    base_price: 39.99, minimum_price: 25.00, cost_price: 14.00,
    image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
    stock_quantity: 175, rating: 4.6, review_count: 88,
    metadata: { brand: 'ClayCraft', pieces: 4, capacity: '12oz', material: 'Ceramic' },
  },
  {
    name: 'Smart Air Purifier',
    slug: 'smart-air-purifier',
    description: 'HEPA air purifier with app control, auto-mode, and real-time air quality display. Covers up to 500 sq ft. Whisper-quiet night mode at just 24dB.',
    categorySlug: 'home-kitchen',
    base_price: 179.99, minimum_price: 130.00, cost_price: 75.00,
    image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop',
    stock_quantity: 60, rating: 4.7, review_count: 134,
    metadata: { brand: 'PureBreeze', coverage: '500 sq ft', filter: 'True HEPA', noise: '24dB' },
  },
  {
    name: 'Cast Iron Dutch Oven 6Qt',
    slug: 'cast-iron-dutch-oven-6qt',
    description: 'Enameled cast iron Dutch oven, 6-quart capacity. Even heat distribution, oven safe to 500°F, perfect for braising, baking, and slow cooking.',
    categorySlug: 'home-kitchen',
    base_price: 69.99, minimum_price: 48.00, cost_price: 28.00,
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    stock_quantity: 85, rating: 4.8, review_count: 267,
    metadata: { brand: 'IronHearth', capacity: '6 Quart', material: 'Enameled Cast Iron' },
  },
  {
    name: 'Bamboo Cutting Board Set',
    slug: 'bamboo-cutting-board-set',
    description: 'Set of 3 organic bamboo cutting boards with juice grooves and easy-grip handles. Naturally antimicrobial and knife-friendly.',
    categorySlug: 'home-kitchen',
    base_price: 34.99, minimum_price: 22.00, cost_price: 12.00,
    image_url: 'https://picsum.photos/seed/cuttingboard/400/400',
    stock_quantity: 200, rating: 4.4, review_count: 156,
    metadata: { brand: 'GreenCut', pieces: 3, material: 'Organic Bamboo' },
  },
  {
    name: 'Minimalist Desk Lamp',
    slug: 'minimalist-desk-lamp',
    description: 'Sleek LED desk lamp with adjustable color temperature (3000K-6500K), 5 brightness levels, USB charging port, and touch controls. Foldable design.',
    categorySlug: 'home-kitchen',
    base_price: 44.99, minimum_price: 30.00, cost_price: 18.00,
    image_url: 'https://picsum.photos/seed/desklamp/400/400',
    stock_quantity: 140, rating: 4.5, review_count: 198,
    metadata: { brand: 'LumiDesk', type: 'LED', color_temp: '3000K-6500K' },
  },
  {
    name: 'Stainless Steel Water Bottle',
    slug: 'stainless-steel-water-bottle',
    description: 'Double-wall vacuum insulated 32oz water bottle. Keeps drinks cold 24hrs or hot 12hrs. BPA-free, leak-proof lid, fits standard cup holders.',
    categorySlug: 'home-kitchen',
    base_price: 27.99, minimum_price: 18.00, cost_price: 9.00,
    image_url: 'https://picsum.photos/seed/waterbottle/400/400',
    stock_quantity: 350, rating: 4.6, review_count: 645,
    metadata: { brand: 'HydroSteel', capacity: '32oz', insulation: 'Double-wall vacuum' },
  },

  // ── Sports & Outdoors (5) ──
  {
    name: 'Yoga Mat Premium 6mm',
    slug: 'yoga-mat-premium-6mm',
    description: 'Extra-thick 6mm yoga mat with non-slip texture on both sides. Eco-friendly TPE material, includes carrying strap. 72" x 24" for all body types.',
    categorySlug: 'sports-outdoors',
    base_price: 39.99, minimum_price: 25.00, cost_price: 13.00,
    image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
    stock_quantity: 220, rating: 4.5, review_count: 345,
    metadata: { brand: 'ZenFlex', thickness: '6mm', material: 'Eco-TPE' },
  },
  {
    name: 'Adjustable Dumbbell Set 50lb',
    slug: 'adjustable-dumbbell-set-50lb',
    description: 'Space-saving adjustable dumbbell set from 5 to 50 lbs. Quick-change weight selector dial, non-slip grip, and durable alloy steel construction.',
    categorySlug: 'sports-outdoors',
    base_price: 299.99, minimum_price: 220.00, cost_price: 140.00,
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop',
    stock_quantity: 50, rating: 4.7, review_count: 178,
    metadata: { brand: 'IronGrip', weight_range: '5-50 lbs', material: 'Alloy Steel' },
  },
  {
    name: 'Camping Hammock with Straps',
    slug: 'camping-hammock-with-straps',
    description: 'Ultra-light parachute nylon hammock supporting up to 400lbs. Includes tree-friendly straps and carabiners. Packs down to the size of a water bottle.',
    categorySlug: 'sports-outdoors',
    base_price: 34.99, minimum_price: 22.00, cost_price: 11.00,
    image_url: 'https://picsum.photos/seed/hammock/400/400',
    stock_quantity: 180, rating: 4.6, review_count: 289,
    metadata: { brand: 'SkyNest', capacity: '400 lbs', material: 'Parachute Nylon' },
  },
  {
    name: 'Resistance Bands Set (5-Pack)',
    slug: 'resistance-bands-set-5pack',
    description: 'Set of 5 latex-free resistance bands with varying tension levels (5-40 lbs). Includes door anchor, handles, and ankle straps. Full-body workout kit.',
    categorySlug: 'sports-outdoors',
    base_price: 24.99, minimum_price: 15.00, cost_price: 7.00,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
    stock_quantity: 280, rating: 4.3, review_count: 412,
    metadata: { brand: 'FlexForce', pieces: 5, resistance: '5-40 lbs' },
  },
  {
    name: 'Insulated Hiking Backpack 40L',
    slug: 'insulated-hiking-backpack-40l',
    description: '40-liter hiking backpack with built-in rain cover, hydration bladder compartment, padded hip belt, and ventilated back panel. Multiple organizer pockets.',
    categorySlug: 'sports-outdoors',
    base_price: 89.99, minimum_price: 65.00, cost_price: 38.00,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    stock_quantity: 100, rating: 4.5, review_count: 176,
    metadata: { brand: 'SummitPack', capacity: '40L', feature: 'rain cover + hydration slot' },
  },

  // ── Books & Stationery (5) ──
  {
    name: 'Leather-Bound Journal A5',
    slug: 'leather-bound-journal-a5',
    description: 'Hand-stitched genuine leather journal with 200 pages of acid-free cream paper. Refillable, with a magnetic clasp and ribbon bookmark.',
    categorySlug: 'books-stationery',
    base_price: 29.99, minimum_price: 20.00, cost_price: 10.00,
    image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
    stock_quantity: 190, rating: 4.7, review_count: 134,
    metadata: { brand: 'InkCraft', pages: 200, material: 'Genuine Leather', size: 'A5' },
  },
  {
    name: 'Fountain Pen Starter Kit',
    slug: 'fountain-pen-starter-kit',
    description: 'Elegant fountain pen with iridium-tipped nib, converter, and 6 ink cartridges. Smooth writing experience for beginners and enthusiasts alike.',
    categorySlug: 'books-stationery',
    base_price: 34.99, minimum_price: 22.00, cost_price: 12.00,
    image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&h=400&fit=crop',
    stock_quantity: 150, rating: 4.4, review_count: 98,
    metadata: { brand: 'ScriptoLux', nib: 'Medium Iridium', includes: 'converter + 6 cartridges' },
  },
  {
    name: 'The Art of Problem Solving',
    slug: 'art-of-problem-solving-book',
    description: 'Bestselling book on creative thinking and structured problem solving. Covers frameworks used by top consultants and engineers. 380 pages, hardcover.',
    categorySlug: 'books-stationery',
    base_price: 22.99, minimum_price: 16.00, cost_price: 8.00,
    image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
    stock_quantity: 300, rating: 4.6, review_count: 452,
    metadata: { author: 'James Thornton', pages: 380, format: 'Hardcover' },
  },
  {
    name: 'Desk Organizer with Drawers',
    slug: 'desk-organizer-with-drawers',
    description: 'Wooden desk organizer with 3 drawers, 6 compartments, and a phone stand. Keeps pens, sticky notes, and supplies tidy. Natural bamboo finish.',
    categorySlug: 'books-stationery',
    base_price: 36.99, minimum_price: 24.00, cost_price: 14.00,
    image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop',
    stock_quantity: 110, rating: 4.3, review_count: 76,
    metadata: { brand: 'TidyDesk', material: 'Bamboo', drawers: 3 },
  },
  {
    name: 'Watercolor Paint Set (48 Colors)',
    slug: 'watercolor-paint-set-48',
    description: 'Professional-grade watercolor set with 48 vibrant colors, 3 brushes, a mixing palette, and a portable metal tin. Highly pigmented and blendable.',
    categorySlug: 'books-stationery',
    base_price: 29.99, minimum_price: 20.00, cost_price: 11.00,
    image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop',
    stock_quantity: 140, rating: 4.5, review_count: 205,
    metadata: { brand: 'ChromaArt', colors: 48, grade: 'Professional' },
  },

  // ── Beauty & Personal Care (5) ──
  {
    name: 'Vitamin C Glow Serum',
    slug: 'vitamin-c-glow-serum',
    description: '30ml vitamin C serum with hyaluronic acid and niacinamide. Brightens skin, reduces dark spots, and boosts collagen. Dermatologist-tested, vegan.',
    categorySlug: 'beauty-personal-care',
    base_price: 28.99, minimum_price: 18.00, cost_price: 8.00,
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    stock_quantity: 250, rating: 4.6, review_count: 387,
    metadata: { brand: 'GlowLab', volume: '30ml', key_ingredients: 'Vitamin C, Hyaluronic Acid' },
  },
  {
    name: 'Bamboo Charcoal Toothbrush 4-Pack',
    slug: 'bamboo-charcoal-toothbrush-4pack',
    description: 'Eco-friendly toothbrushes with biodegradable bamboo handles and charcoal-infused bristles for deep cleaning. BPA-free and plastic-free packaging.',
    categorySlug: 'beauty-personal-care',
    base_price: 9.99, minimum_price: 6.00, cost_price: 3.00,
    image_url: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop',
    stock_quantity: 400, rating: 4.2, review_count: 298,
    metadata: { brand: 'EcoBrush', pieces: 4, material: 'Bamboo + Charcoal Bristles' },
  },
  {
    name: 'Argan Oil Hair Mask',
    slug: 'argan-oil-hair-mask',
    description: 'Deep conditioning hair mask with cold-pressed Moroccan argan oil and keratin. Repairs damage, reduces frizz, and adds shine. Sulfate-free, 250ml.',
    categorySlug: 'beauty-personal-care',
    base_price: 19.99, minimum_price: 12.00, cost_price: 6.00,
    image_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop',
    stock_quantity: 200, rating: 4.5, review_count: 231,
    metadata: { brand: 'SilkRoot', volume: '250ml', key_ingredient: 'Argan Oil + Keratin' },
  },
  {
    name: 'Essential Oils Diffuser',
    slug: 'essential-oils-diffuser',
    description: 'Ultrasonic aroma diffuser with mood-setting LED lights, 300ml tank, auto shut-off, and whisper-quiet operation. Covers up to 350 sq ft.',
    categorySlug: 'beauty-personal-care',
    base_price: 34.99, minimum_price: 22.00, cost_price: 13.00,
    image_url: 'https://picsum.photos/seed/diffuser/400/400',
    stock_quantity: 170, rating: 4.4, review_count: 189,
    metadata: { brand: 'AromaZen', capacity: '300ml', coverage: '350 sq ft' },
  },
  {
    name: 'SPF 50 Mineral Sunscreen',
    slug: 'spf50-mineral-sunscreen',
    description: 'Lightweight mineral sunscreen with SPF 50. Non-greasy, reef-safe formula with zinc oxide. No white cast, suitable for all skin tones. 100ml tube.',
    categorySlug: 'beauty-personal-care',
    base_price: 18.99, minimum_price: 12.00, cost_price: 5.50,
    image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    stock_quantity: 320, rating: 4.5, review_count: 410,
    metadata: { brand: 'SunShield', spf: 50, volume: '100ml', type: 'Mineral (Zinc Oxide)' },
  },
];

// ── Main seed function ───────────────────────────────────────
async function seed() {
  console.log('🌱 Starting product seed...\n');

  // 1) Upsert categories
  console.log('📂 Inserting categories...');
  const { data: catData, error: catErr } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' })
    .select('id, slug');

  if (catErr) {
    console.error('Category insert error:', catErr);
    process.exit(1);
  }
  const categoryMap = new Map(catData!.map((c: { id: string; slug: string }) => [c.slug, c.id]));
  console.log(`   ✓ ${catData!.length} categories ready\n`);

  // 2) Insert products
  console.log('📦 Inserting products...');
  let insertedCount = 0;
  const productIds: Map<string, string> = new Map();

  for (const p of products) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) {
      console.warn(`   ⚠ Category "${p.categorySlug}" not found – skipping ${p.name}`);
      continue;
    }

    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', p.slug)
      .maybeSingle();

    if (existing) {
      console.log(`   ⏭ "${p.name}" already exists – updating image`);
      productIds.set(p.slug, existing.id);
      // Update image_url for existing products (fix placeholder text → real images)
      await supabase
        .from('products')
        .update({ image_url: p.image_url, images: [p.image_url] })
        .eq('id', existing.id);
      continue;
    }

    const { data: inserted, error: prodErr } = await supabase
      .from('products')
      .insert({
        name: p.name,
        slug: p.slug,
        description: p.description,
        category_id: categoryId,
        base_price: p.base_price,
        minimum_price: p.minimum_price,
        cost_price: p.cost_price,
        image_url: p.image_url,
        images: [p.image_url],
        rating: p.rating,
        review_count: p.review_count,
        stock_quantity: p.stock_quantity,
        is_active: true,
        metadata: p.metadata,
      })
      .select('id')
      .single();

    if (prodErr) {
      console.error(`   ✗ Failed to insert "${p.name}":`, prodErr.message);
      continue;
    }

    productIds.set(p.slug, inserted!.id);
    insertedCount++;

    // Insert variants if any
    if (p.variants && p.variants.length > 0) {
      const variantRows = p.variants.map((v) => ({
        product_id: inserted!.id,
        sku: v.sku,
        color: v.color ?? null,
        size: v.size ?? null,
        stock_quantity: v.stock_quantity,
        price_adjustment: v.price_adjustment,
        is_active: true,
      }));
      const { error: varErr } = await supabase.from('product_variants').insert(variantRows);
      if (varErr) {
        console.warn(`   ⚠ Variants for "${p.name}" failed:`, varErr.message);
      }
    }
  }
  console.log(`   ✓ ${insertedCount} products inserted (${productIds.size} total)\n`);

  // 3) Generate & store embeddings
  console.log('🧠 Generating embeddings (this takes a minute)...');
  let embeddingCount = 0;
  let embeddingFailed = 0;

  for (const p of products) {
    const productId = productIds.get(p.slug);
    if (!productId) continue;

    // Check if embedding already exists
    const { data: existingEmb } = await supabase
      .from('product_embeddings')
      .select('id')
      .eq('product_id', productId)
      .maybeSingle();

    if (existingEmb) {
      console.log(`   ⏭ Embedding for "${p.name}" exists – skipping`);
      embeddingCount++;
      continue;
    }

    const content = [
      p.name,
      p.description,
      ...Object.entries(p.metadata).map(([k, v]) => `${k}: ${v}`),
      `category: ${p.categorySlug.replace('-', ' ')}`,
      `price: $${p.base_price}`,
    ].join('. ');

    try {
      const embedding = await generateEmbedding(content);

      const { error: embErr } = await supabase.from('product_embeddings').insert({
        product_id: productId,
        embedding: JSON.stringify(embedding),
        content,
      });

      if (embErr) {
        console.warn(`   ⚠ Embedding store failed for "${p.name}":`, embErr.message);
        embeddingFailed++;
      } else {
        embeddingCount++;
        process.stdout.write(`   ✓ ${embeddingCount}/${products.length} embeddings\r`);
      }

      // Small delay to avoid rate limit
      await new Promise((r) => setTimeout(r, 250));
    } catch (err) {
      console.warn(`   ⚠ Embedding generation failed for "${p.name}":`, (err as Error).message);
      embeddingFailed++;
    }
  }

  console.log(`\n   ✓ ${embeddingCount} embeddings created, ${embeddingFailed} failed\n`);
  console.log('✅ Seed complete!');
}

seed().catch(console.error);
