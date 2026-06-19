-- ============================================
-- NIKILL E-COMMERCE — SEED DATA
-- Run this in Supabase SQL Editor after tables are created
-- ============================================

-- FIRST: Add stripe_session_id column if not exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);

-- SECOND: Add missing RLS policies for orders
DROP POLICY IF EXISTS "Allow all to insert orders" ON orders;
CREATE POLICY "Allow all to insert orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all to select orders" ON orders;
CREATE POLICY "Allow all to select orders" ON orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all to insert order_items" ON order_items;
CREATE POLICY "Allow all to insert order_items" ON order_items FOR INSERT WITH CHECK (true);

-- =====================
-- CATEGORIES
-- =====================
INSERT INTO public.categories (name, image_url, is_top) VALUES
('Sneakers', '/assets/hero1.png', true),
('Running', '/assets/hero2.png', true),
('Basketball', '/assets/hero3.png', true),
('Lifestyle', '/assets/hero4.png', true),
('Training', '/assets/hero5.png', true),
('Sports', '/assets/hero6.png', true),
('Joggers', '/assets/hero7.png', false),
('Football', '/assets/hero1.png', false);

-- =====================
-- PRODUCTS (15 products)
-- =====================

-- 1. Men Sneaker - Featured + Sale
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Air Max Alpha 270', 'Premium cushioning with responsive Air Max technology. Breathable mesh upper for all-day comfort and street style.', 119.99, 159.99, '25% OFF', true, 'Sneakers', 'Men', 4.8, 124);

-- 2. Men Running - Featured + New
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Zoom Pegasus Ultra', 'Built for speed. React foam midsole provides incredible energy return mile after mile.', 149.99, null, 'New', true, 'Running', 'Men', 4.9, 89);

-- 3. Women Lifestyle - Featured
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Blazer Mid Premium', 'Vintage silhouette meets modern comfort. Premium leather upper with classic stitching details.', 105.00, null, null, true, 'Lifestyle', 'Women', 4.7, 201);

-- 4. Men Training - Featured + Sale
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Metcon Power X', 'Engineered for high-intensity training. Flat, wide heel for stability during heavy lifts.', 127.50, 170.00, '25% OFF', true, 'Training', 'Men', 4.6, 76);

-- 5. Women Running - New Arrival
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Free Run Flyknit', 'Barefoot-like flexibility meets plush cushioning. Flyknit adapts to every stride.', 130.00, null, 'New', true, 'Running', 'Women', 4.8, 154);

-- 6. Men Basketball - Featured
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Court Dominator Pro', 'Ankle support and explosive traction. Built for the hardwood with Zoom Air cushioning.', 175.00, null, null, true, 'Basketball', 'Men', 4.5, 63);

-- 7. Women Sneakers - Sale
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Air Force One Sage', 'Elevated platform design with classic Air Force 1 DNA. Premium tumbled leather.', 89.99, 120.00, '25% OFF', false, 'Sneakers', 'Women', 4.9, 312);

-- 8. Men Lifestyle - Featured + New
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Dunk Low Retro', 'The icon reborn. Two-tone colorway on buttery soft leather. A timeless classic.', 110.00, null, 'New', true, 'Lifestyle', 'Men', 4.7, 445);

-- 9. Women Training - Sale
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('SuperRep Groove', 'Dance-inspired training shoe with pivot points and exceptional flexibility.', 79.99, 110.00, '27% OFF', false, 'Training', 'Women', 4.4, 87);

-- 10. Baby Sneakers - New Arrival
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Tiny Steps First', 'Soft sole design perfect for little feet learning to walk. Velcro strap for easy on/off.', 35.00, null, 'New', false, 'Sneakers', 'Baby', 4.9, 203);

-- 11. New Born - New Arrival
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Crib Booties Cloud', 'Ultra-soft booties designed for newborns. Gentle elastic keeps them snug and secure.', 25.00, null, 'New', false, 'Lifestyle', 'New Born', 5.0, 89);

-- 12. Baba Sports - Sale
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Junior Sprint Elite', 'Lightweight cushioning for growing feet. Durable rubber outsole for playground adventures.', 42.00, 55.00, '24% OFF', false, 'Sports', 'Baba', 4.6, 67);

-- 13. Men Joggers
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('React Infinity Run', 'Designed to help reduce injury. Rocker geometry and React foam keep you rolling forward.', 160.00, null, null, false, 'Joggers', 'Men', 4.7, 198);

-- 14. Women Sneakers - Featured + Sale
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Waffle Debut Vintage', 'Heritage styling meets modern comfort. Classic waffle outsole for timeless traction.', 67.50, 90.00, '25% OFF', true, 'Sneakers', 'Women', 4.8, 276);

-- 15. Men Sports - New
INSERT INTO public.products (name, description, price, original_price, discount_badge, is_featured, category_name, target_audience, rating, reviews_count) VALUES
('Phantom GT Elite', 'Precision control for the pitch. Textured upper and anti-clog traction for all conditions.', 195.00, null, 'New', false, 'Football', 'Men', 4.5, 54);


-- =====================
-- PRODUCT IMAGES (4 images each for first 8 products, 1-2 for rest)
-- We need the product IDs, so we use a subquery approach
-- =====================

-- Product 1: Air Max Alpha 270
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000', true, 0 FROM products WHERE name = 'Air Max Alpha 270'
UNION ALL SELECT id, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000', false, 1 FROM products WHERE name = 'Air Max Alpha 270'
UNION ALL SELECT id, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000', false, 2 FROM products WHERE name = 'Air Max Alpha 270'
UNION ALL SELECT id, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000', false, 3 FROM products WHERE name = 'Air Max Alpha 270';

-- Product 2: Zoom Pegasus Ultra
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1000', true, 0 FROM products WHERE name = 'Zoom Pegasus Ultra'
UNION ALL SELECT id, 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1000', false, 1 FROM products WHERE name = 'Zoom Pegasus Ultra'
UNION ALL SELECT id, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1000', false, 2 FROM products WHERE name = 'Zoom Pegasus Ultra';

-- Product 3: Blazer Mid Premium
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000', true, 0 FROM products WHERE name = 'Blazer Mid Premium'
UNION ALL SELECT id, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000', false, 1 FROM products WHERE name = 'Blazer Mid Premium';

-- Product 4: Metcon Power X
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000', true, 0 FROM products WHERE name = 'Metcon Power X'
UNION ALL SELECT id, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000', false, 1 FROM products WHERE name = 'Metcon Power X';

-- Product 5: Free Run Flyknit
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000', true, 0 FROM products WHERE name = 'Free Run Flyknit'
UNION ALL SELECT id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000', false, 1 FROM products WHERE name = 'Free Run Flyknit';

-- Product 6: Court Dominator Pro
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1000', true, 0 FROM products WHERE name = 'Court Dominator Pro'
UNION ALL SELECT id, 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1000', false, 1 FROM products WHERE name = 'Court Dominator Pro';

-- Product 7: Air Force One Sage
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000', true, 0 FROM products WHERE name = 'Air Force One Sage';

-- Product 8: Dunk Low Retro
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1000', true, 0 FROM products WHERE name = 'Dunk Low Retro'
UNION ALL SELECT id, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000', false, 1 FROM products WHERE name = 'Dunk Low Retro';

-- Product 9-15: one image each
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000', true, 0 FROM products WHERE name = 'SuperRep Groove';
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000', true, 0 FROM products WHERE name = 'Tiny Steps First';
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000', true, 0 FROM products WHERE name = 'Crib Booties Cloud';
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1000', true, 0 FROM products WHERE name = 'Junior Sprint Elite';
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1000', true, 0 FROM products WHERE name = 'React Infinity Run';
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000', true, 0 FROM products WHERE name = 'Waffle Debut Vintage';
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT id, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1000', true, 0 FROM products WHERE name = 'Phantom GT Elite';


-- =====================
-- PRODUCT COLORS (2-3 per product)
-- =====================

-- Product 1
INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Red/Black', '#E63946' FROM products WHERE name = 'Air Max Alpha 270'
UNION ALL SELECT id, 'Pure White', '#FFFFFF' FROM products WHERE name = 'Air Max Alpha 270'
UNION ALL SELECT id, 'Midnight Navy', '#1D3557' FROM products WHERE name = 'Air Max Alpha 270';

-- Product 2
INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Electric Green', '#2A9D8F' FROM products WHERE name = 'Zoom Pegasus Ultra'
UNION ALL SELECT id, 'Black', '#000000' FROM products WHERE name = 'Zoom Pegasus Ultra'
UNION ALL SELECT id, 'Grey', '#808080' FROM products WHERE name = 'Zoom Pegasus Ultra';

-- Product 3
INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'White', '#FFFFFF' FROM products WHERE name = 'Blazer Mid Premium'
UNION ALL SELECT id, 'Black', '#000000' FROM products WHERE name = 'Blazer Mid Premium';

-- Product 4
INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Black/Gold', '#000000' FROM products WHERE name = 'Metcon Power X'
UNION ALL SELECT id, 'Red', '#E63946' FROM products WHERE name = 'Metcon Power X';

-- Product 5
INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Pink', '#FFB6C1' FROM products WHERE name = 'Free Run Flyknit'
UNION ALL SELECT id, 'White', '#FFFFFF' FROM products WHERE name = 'Free Run Flyknit'
UNION ALL SELECT id, 'Blue', '#1D3557' FROM products WHERE name = 'Free Run Flyknit';

-- Product 6
INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Black/Red', '#E63946' FROM products WHERE name = 'Court Dominator Pro'
UNION ALL SELECT id, 'White/Blue', '#1D3557' FROM products WHERE name = 'Court Dominator Pro';

-- Product 7
INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'White', '#FFFFFF' FROM products WHERE name = 'Air Force One Sage'
UNION ALL SELECT id, 'Pink', '#FFB6C1' FROM products WHERE name = 'Air Force One Sage';

-- Product 8
INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Black/White', '#000000' FROM products WHERE name = 'Dunk Low Retro'
UNION ALL SELECT id, 'Green/White', '#2A9D8F' FROM products WHERE name = 'Dunk Low Retro'
UNION ALL SELECT id, 'Grey', '#808080' FROM products WHERE name = 'Dunk Low Retro';

-- Products 9-15 (basic colors)
INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Black', '#000000' FROM products WHERE name = 'SuperRep Groove'
UNION ALL SELECT id, 'White', '#FFFFFF' FROM products WHERE name = 'SuperRep Groove';

INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Blue', '#1D3557' FROM products WHERE name = 'Tiny Steps First'
UNION ALL SELECT id, 'Pink', '#FFB6C1' FROM products WHERE name = 'Tiny Steps First';

INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'White', '#FFFFFF' FROM products WHERE name = 'Crib Booties Cloud';

INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Blue', '#1D3557' FROM products WHERE name = 'Junior Sprint Elite'
UNION ALL SELECT id, 'Red', '#E63946' FROM products WHERE name = 'Junior Sprint Elite';

INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Black', '#000000' FROM products WHERE name = 'React Infinity Run'
UNION ALL SELECT id, 'White', '#FFFFFF' FROM products WHERE name = 'React Infinity Run';

INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Beige', '#E9C46A' FROM products WHERE name = 'Waffle Debut Vintage'
UNION ALL SELECT id, 'White', '#FFFFFF' FROM products WHERE name = 'Waffle Debut Vintage';

INSERT INTO public.product_colors (product_id, name, hex_code)
SELECT id, 'Black/Yellow', '#E9C46A' FROM products WHERE name = 'Phantom GT Elite'
UNION ALL SELECT id, 'White/Orange', '#FF6B00' FROM products WHERE name = 'Phantom GT Elite';


-- =====================
-- SAMPLE REVIEWS
-- =====================
INSERT INTO public.reviews (product_id, user_name, rating, review_text)
SELECT id, 'Alex M.', 5, 'Absolutely love these shoes! The comfort level is insane. Best purchase I have made all year.' FROM products WHERE name = 'Air Max Alpha 270';

INSERT INTO public.reviews (product_id, user_name, rating, review_text)
SELECT id, 'Sarah J.', 4, 'Great fit and very stylish. Took one run to break them in, but now they are my go-to pair.' FROM products WHERE name = 'Air Max Alpha 270';

INSERT INTO public.reviews (product_id, user_name, rating, review_text)
SELECT id, 'David K.', 5, 'Premium quality as expected. The cushioning is unbelievable and the colorway is fire.' FROM products WHERE name = 'Air Max Alpha 270';

INSERT INTO public.reviews (product_id, user_name, rating, review_text)
SELECT id, 'Maria L.', 5, 'These are the best running shoes I have ever owned. So lightweight and responsive!' FROM products WHERE name = 'Zoom Pegasus Ultra';

INSERT INTO public.reviews (product_id, user_name, rating, review_text)
SELECT id, 'James W.', 4, 'Solid shoe for training. Love the flat base for deadlifts but wish it had more ankle padding.' FROM products WHERE name = 'Metcon Power X';

INSERT INTO public.reviews (product_id, user_name, rating, review_text)
SELECT id, 'Emily R.', 5, 'Gorgeous vintage look! I get compliments everywhere I go. So comfortable too.' FROM products WHERE name = 'Blazer Mid Premium';

-- Done! Your NIKILL store is now loaded with data! 🎉
