-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to Supabase Auth)
-- Stores extra user information like full name and avatar
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(255),
    avatar_url VARCHAR(255),
    stripe_customer_id VARCHAR(255), -- Stripe Customer ID created on signup
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. CATEGORIES TABLE
-- Supports the "Top Categories" section and general category pages
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_top BOOLEAN DEFAULT false, -- For the Top Categories section
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PRODUCTS TABLE
-- Main table for all products
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name VARCHAR(255), -- Denormalized for easy querying (e.g. "Men's Training Shoes")
    target_audience VARCHAR(100), -- e.g., "Men", "Women", "Baby"
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2), -- For discounts/strike-through prices
    discount_badge VARCHAR(50), -- e.g., "22% OFF", "Sale", "New"
    is_featured BOOLEAN DEFAULT false, -- For the Featured Products section
    rating NUMERIC(3, 2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    stripe_product_id VARCHAR(255), -- Stripe Product ID (synced via admin)
    stripe_price_id VARCHAR(255), -- Stripe Price ID (synced via admin)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. PRODUCT IMAGES TABLE
-- A product can have multiple images for the gallery
CREATE TABLE public.product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT false, -- The main image shown on cards
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. PRODUCT COLORS TABLE
-- Colors available for a product
CREATE TABLE public.product_colors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Red/Black"
    hex_code VARCHAR(10) NOT NULL, -- e.g., "#E63946"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. REVIEWS TABLE
-- Customer reviews for products
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL, -- Name at the time of review
    avatar_url TEXT, -- Avatar at the time of review
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. ORDERS TABLE
-- Stores user orders after checkout
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guest checkouts
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    promo_code VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, shipped, delivered
    stripe_session_id VARCHAR(255), -- Stripe checkout session ID
    stripe_payment_intent_id VARCHAR(255), -- Stripe PaymentIntent ID
    stripe_invoice_id VARCHAR(255), -- Stripe Invoice ID
    stripe_invoice_url TEXT, -- Stripe hosted invoice/receipt URL
    stripe_payment_method_id VARCHAR(255), -- Stripe Payment Method used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. ORDER ITEMS TABLE
-- Stores the specific products, sizes, and colors in an order
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL, -- Stored in case product name changes later
    selected_color VARCHAR(100) NOT NULL,
    selected_size VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_purchase NUMERIC(10, 2) NOT NULL,
    stripe_product_id VARCHAR(255), -- Stripe Product ID for this item
    stripe_price_id VARCHAR(255), -- Stripe Price ID for this item
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. APP SETTINGS TABLE
-- Stores API keys, config values (Stripe, etc.)
CREATE TABLE public.app_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    is_secret BOOLEAN DEFAULT false, -- If true, value is masked in API responses
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. PAYMENT METHODS TABLE
-- Stores saved payment methods per user
CREATE TABLE public.payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- user ID from auth
    card_brand VARCHAR(50), -- visa, mastercard, etc.
    last4 VARCHAR(4) NOT NULL,
    exp_month INTEGER,
    exp_year INTEGER,
    cardholder_name VARCHAR(255),
    stripe_payment_method_id VARCHAR(255), -- optional Stripe PM ID
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. CART ITEMS TABLE
-- Stores cart items per user (persists across sessions)
CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    cart_item_id VARCHAR(255) NOT NULL, -- productId-color-size (unique per user)
    product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(50) NOT NULL,
    original_price VARCHAR(50),
    image TEXT,
    color VARCHAR(100),
    size VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. FAVORITES TABLE
-- Stores favorite/wishlist products per user
CREATE TABLE public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(50) NOT NULL,
    original_price VARCHAR(50),
    image TEXT,
    category VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- SET UP ROW LEVEL SECURITY (RLS) - Optional but recommended
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products, categories, and reviews
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Categories are viewable by everyone." ON categories;
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products are viewable by everyone." ON products;
CREATE POLICY "Products are viewable by everyone." ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Product images are viewable by everyone." ON product_images;
CREATE POLICY "Product images are viewable by everyone." ON product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Product colors are viewable by everyone." ON product_colors;
CREATE POLICY "Product colors are viewable by everyone." ON product_colors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON reviews;
CREATE POLICY "Reviews are viewable by everyone." ON reviews FOR SELECT USING (true);

-- Allow authenticated users to create reviews
DROP POLICY IF EXISTS "Users can create reviews." ON reviews;
CREATE POLICY "Users can create reviews." ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to see only their own orders
DROP POLICY IF EXISTS "Users can view own orders." ON orders;
CREATE POLICY "Users can view own orders." ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own order items." ON order_items;
CREATE POLICY "Users can view own order items." ON order_items FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

-- ALLOW INSERTS FOR ADMIN PANEL (Currently allowing all, update later for security)
DROP POLICY IF EXISTS "Allow all to insert categories" ON categories;
CREATE POLICY "Allow all to insert categories" ON categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all to update categories" ON categories;
CREATE POLICY "Allow all to update categories" ON categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow all to insert products" ON products;
CREATE POLICY "Allow all to insert products" ON products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all to update products" ON products;
CREATE POLICY "Allow all to update products" ON products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow all to insert product_images" ON product_images;
CREATE POLICY "Allow all to insert product_images" ON product_images FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all to insert product_colors" ON product_colors;
CREATE POLICY "Allow all to insert product_colors" ON product_colors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all to insert orders" ON orders;
CREATE POLICY "Allow all to insert orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all to select orders" ON orders;
CREATE POLICY "Allow all to select orders" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all to insert order_items" ON order_items;
CREATE POLICY "Allow all to insert order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Settings policies (Admin can read, insert, update)
DROP POLICY IF EXISTS "Allow all to read settings" ON app_settings;
CREATE POLICY "Allow all to read settings" ON app_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all to insert settings" ON app_settings;
CREATE POLICY "Allow all to insert settings" ON app_settings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all to update settings" ON app_settings;
CREATE POLICY "Allow all to update settings" ON app_settings FOR UPDATE USING (true);

-- Payment Methods policies
DROP POLICY IF EXISTS "Allow all to read payment_methods" ON payment_methods;
CREATE POLICY "Allow all to read payment_methods" ON payment_methods FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all to insert payment_methods" ON payment_methods;
CREATE POLICY "Allow all to insert payment_methods" ON payment_methods FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all to update payment_methods" ON payment_methods;
CREATE POLICY "Allow all to update payment_methods" ON payment_methods FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all to delete payment_methods" ON payment_methods;
CREATE POLICY "Allow all to delete payment_methods" ON payment_methods FOR DELETE USING (true);

-- Cart Items policies
DROP POLICY IF EXISTS "Allow all to read cart_items" ON cart_items;
CREATE POLICY "Allow all to read cart_items" ON cart_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all to insert cart_items" ON cart_items;
CREATE POLICY "Allow all to insert cart_items" ON cart_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all to update cart_items" ON cart_items;
CREATE POLICY "Allow all to update cart_items" ON cart_items FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all to delete cart_items" ON cart_items;
CREATE POLICY "Allow all to delete cart_items" ON cart_items FOR DELETE USING (true);

-- Favorites policies
DROP POLICY IF EXISTS "Allow all to read favorites" ON favorites;
CREATE POLICY "Allow all to read favorites" ON favorites FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all to insert favorites" ON favorites;
CREATE POLICY "Allow all to insert favorites" ON favorites FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all to delete favorites" ON favorites;
CREATE POLICY "Allow all to delete favorites" ON favorites FOR DELETE USING (true);
