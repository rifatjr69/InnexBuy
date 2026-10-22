-- ==============================================================================
-- MUBA GADGETS: COMPLETE ALL-IN-ONE SUPABASE DATABASE SETUP SCRIPT
-- Run this ONCE in your Supabase SQL Editor (https://supabase.com/dashboard)
-- This script is completely IDEMPOTENT (safe to run multiple times).
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS (Safe creation)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.1 ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT,
  district TEXT,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  name_bn TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT 'Tag',
  image_url TEXT,
  sub_label TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_bn TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Tag';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sub_label TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_bn TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  description_bn TEXT,
  short_description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  old_price NUMERIC(10, 2),
  discount_percent INT DEFAULT 0,
  badge TEXT,
  rating NUMERIC(2, 1) DEFAULT 4.8,
  review_count INT DEFAULT 50,
  stock INT DEFAULT 100,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_flash_sale BOOLEAN DEFAULT FALSE,
  enable_size BOOLEAN DEFAULT FALSE,
  enable_color BOOLEAN DEFAULT FALSE,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist even if products table was created earlier
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name_bn TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_bn TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS old_price NUMERIC(10, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percent INT DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_flash_sale BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS enable_size BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS enable_color BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';

-- 6. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  price NUMERIC(10, 2)
);

-- 7. HERO BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  link_url TEXT,
  link TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS link TEXT;

-- 8. DELIVERY ZONES TABLE
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  charge NUMERIC(10, 2) NOT NULL,
  estimated_days TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.delivery_zones ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.delivery_zones ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 9. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'percent',
  value NUMERIC(10, 2) NOT NULL,
  min_order NUMERIC(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ORDERS & ORDER ITEMS TABLES
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_zone TEXT NOT NULL,
  delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 60,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  coupon_code TEXT,
  payment_method TEXT DEFAULT 'COD',
  status TEXT DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant TEXT,
  quantity INT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TRACKING SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.tracking_settings (
  id INT PRIMARY KEY DEFAULT 1,
  fb_pixel_id TEXT,
  fb_pixel_code TEXT,
  fb_access_token TEXT,
  fb_enabled BOOLEAN DEFAULT false,
  gtm_id TEXT,
  gtm_head_code TEXT,
  gtm_body_code TEXT,
  gtm_enabled BOOLEAN DEFAULT false,
  tiktok_pixel_id TEXT,
  tiktok_pixel_code TEXT,
  tiktok_enabled BOOLEAN DEFAULT false,
  custom_head_code TEXT,
  custom_body_code TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SITE EVENTS TABLE (FOR ANALYTICS & VISITOR FUNNEL)
CREATE TABLE IF NOT EXISTS public.site_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  session_id TEXT,
  country TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. STORAGE BUCKETS (product-images, categories, banners)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('categories', 'categories', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- 14. ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert profiles" ON public.profiles;
CREATE POLICY "Allow insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update profiles" ON public.profiles;
CREATE POLICY "Allow update profiles" ON public.profiles FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete profiles" ON public.profiles;
CREATE POLICY "Allow delete profiles" ON public.profiles FOR DELETE USING (true);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read addresses" ON public.addresses;
CREATE POLICY "Public read addresses" ON public.addresses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert addresses" ON public.addresses;
CREATE POLICY "Allow insert addresses" ON public.addresses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update addresses" ON public.addresses;
CREATE POLICY "Allow update addresses" ON public.addresses FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete addresses" ON public.addresses;
CREATE POLICY "Allow delete addresses" ON public.addresses FOR DELETE USING (true);


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>"full_name", split_part(NEW.email, "@", 1)),
    "user"
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;

-- Categories Policies
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert categories" ON public.categories;
CREATE POLICY "Allow insert categories" ON public.categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update categories" ON public.categories;
CREATE POLICY "Allow update categories" ON public.categories FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete categories" ON public.categories;
CREATE POLICY "Allow delete categories" ON public.categories FOR DELETE USING (true);

-- Products Policies
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert products" ON public.products;
CREATE POLICY "Allow insert products" ON public.products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update products" ON public.products;
CREATE POLICY "Allow update products" ON public.products FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete products" ON public.products;
CREATE POLICY "Allow delete products" ON public.products FOR DELETE USING (true);

-- Product Variants Policies
DROP POLICY IF EXISTS "Public read product variants" ON public.product_variants;
CREATE POLICY "Public read product variants" ON public.product_variants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow manage product variants" ON public.product_variants;
CREATE POLICY "Allow manage product variants" ON public.product_variants FOR ALL USING (true);

-- Banners Policies
DROP POLICY IF EXISTS "Public read banners" ON public.banners;
CREATE POLICY "Public read banners" ON public.banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow manage banners" ON public.banners;
CREATE POLICY "Allow manage banners" ON public.banners FOR ALL USING (true);

-- Delivery Zones Policies
DROP POLICY IF EXISTS "Public read delivery zones" ON public.delivery_zones;
CREATE POLICY "Public read delivery zones" ON public.delivery_zones FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow manage delivery zones" ON public.delivery_zones;
CREATE POLICY "Allow manage delivery zones" ON public.delivery_zones FOR ALL USING (true);

-- Coupons Policies
DROP POLICY IF EXISTS "Public read coupons" ON public.coupons;
CREATE POLICY "Public read coupons" ON public.coupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow manage coupons" ON public.coupons;
CREATE POLICY "Allow manage coupons" ON public.coupons FOR ALL USING (true);

-- Orders & Order Items Policies
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow update orders" ON public.orders;
CREATE POLICY "Allow update orders" ON public.orders FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete orders" ON public.orders;
CREATE POLICY "Allow delete orders" ON public.orders FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public insert order items" ON public.order_items;
CREATE POLICY "Public insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public read order items" ON public.order_items;
CREATE POLICY "Public read order items" ON public.order_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow delete order items" ON public.order_items;
CREATE POLICY "Allow delete order items" ON public.order_items FOR DELETE USING (true);

-- Tracking Settings Policies
DROP POLICY IF EXISTS "Public read tracking settings" ON public.tracking_settings;
CREATE POLICY "Public read tracking settings" ON public.tracking_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow manage tracking settings" ON public.tracking_settings;
CREATE POLICY "Allow manage tracking settings" ON public.tracking_settings FOR ALL USING (true);

-- Site Events Policies
DROP POLICY IF EXISTS "Public insert site events" ON public.site_events;
CREATE POLICY "Public insert site events" ON public.site_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public read site events" ON public.site_events;
CREATE POLICY "Public read site events" ON public.site_events FOR SELECT USING (true);

-- Storage Policies
DROP POLICY IF EXISTS "Public Read product-images" ON storage.objects;
CREATE POLICY "Public Read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Allow upload product-images" ON storage.objects;
CREATE POLICY "Allow upload product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Allow update product-images" ON storage.objects;
CREATE POLICY "Allow update product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Allow delete product-images" ON storage.objects;
CREATE POLICY "Allow delete product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public Read categories_bucket" ON storage.objects;
CREATE POLICY "Public Read categories_bucket" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
DROP POLICY IF EXISTS "Allow upload categories_bucket" ON storage.objects;
CREATE POLICY "Allow upload categories_bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'categories');
DROP POLICY IF EXISTS "Allow update categories_bucket" ON storage.objects;
CREATE POLICY "Allow update categories_bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'categories');
DROP POLICY IF EXISTS "Allow delete categories_bucket" ON storage.objects;
CREATE POLICY "Allow delete categories_bucket" ON storage.objects FOR DELETE USING (bucket_id = 'categories');

DROP POLICY IF EXISTS "Public Read banners" ON storage.objects;
CREATE POLICY "Public Read banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
DROP POLICY IF EXISTS "Allow upload banners" ON storage.objects;
CREATE POLICY "Allow upload banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners');
DROP POLICY IF EXISTS "Allow update banners" ON storage.objects;
CREATE POLICY "Allow update banners" ON storage.objects FOR UPDATE USING (bucket_id = 'banners');
DROP POLICY IF EXISTS "Allow delete banners" ON storage.objects;
CREATE POLICY "Allow delete banners" ON storage.objects FOR DELETE USING (bucket_id = 'banners');

-- 15. SEED INITIAL DATA (CATEGORIES, BANNERS, DELIVERY ZONES, COUPONS, PRODUCTS)
INSERT INTO public.categories (name, name_en, name_bn, slug, icon, sub_label, sort_order)
VALUES
  ('Smartwatches', 'Smartwatches', 'স্মার্টওয়াচ', 'smartwatches', 'Watch', 'AMOLED, Bluetooth Calling', 1),
  ('TWS Earbuds', 'TWS Earbuds', 'ওয়্যারলেস ইয়ারবাড', 'tws-earbuds', 'Headphones', 'ANC, Deep Bass, Long Battery', 2),
  ('Power Banks', 'Power Banks', 'পাওয়ার ব্যাংক', 'power-banks', 'Battery', '20W/65W PD Fast Charging', 3),
  ('GaN Chargers', 'GaN Chargers', 'চার্জার ও অ্যাডাপ্টার', 'chargers', 'Zap', 'Fast charging adapters', 4),
  ('Phone Accessories', 'Phone Accessories', 'ফোন এক্সেসরিজ', 'accessories', 'Smartphone', 'Cases, holders, cables', 5),
  ('Gaming Gadgets', 'Gaming Gadgets', 'গেমিং গ্যাজেটস', 'gaming', 'Gamepad2', 'Triggers, coolers, controllers', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.banners (title, image_url, link_url, sort_order, is_active)
SELECT 'ভেরিফাইড স্মার্ট গ্যাজেট মেগা সেল ২০২৬', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&h=720&q=85', '/shop', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.banners LIMIT 1);

INSERT INTO public.banners (title, image_url, link_url, sort_order, is_active)
SELECT 'প্রিমিয়াম ওয়্যারলেস এএনসি ইয়ারবাড কালেকশন', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1920&h=720&q=85', '/shop?category=tws-earbuds', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.banners WHERE sort_order = 2);

INSERT INTO public.banners (title, image_url, link_url, sort_order, is_active)
SELECT 'অ্যামোলেড ব্লুটুথ কলিং স্মার্টওয়াচ কালেকশন', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&h=720&q=85', '/shop?category=smartwatches', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.banners WHERE sort_order = 3);

INSERT INTO public.delivery_zones (name, name_bn, charge, estimated_days, sort_order)
VALUES
  ('Inside Dhaka', 'ঢাকার ভিতরে (Inside Dhaka)', 60, '১-২ কার্যদিবস', 1),
  ('Sub-Dhaka', 'ঢাকার আশেপাশে (সাভার, গাজীপুর, নারায়ণগঞ্জ)', 100, '২-৩ কার্যদিবস', 2),
  ('Outside Dhaka', 'ঢাকার বাইরে পুরো বাংলাদেশ', 130, '৩-৫ কার্যদিবস', 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.coupons (code, type, value, min_order)
VALUES
  ('MUBA50', 'fixed', 50, 999),
  ('GADGET10', 'percent', 10, 1499)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.products (name, name_bn, slug, price, old_price, discount_percent, badge, rating, review_count, stock, image_url, images, short_description, is_featured, is_flash_sale)
SELECT 
  'Muba Ultra 2 AMOLED Bluetooth Calling Smartwatch',
  'মুবা আল্ট্রা ২ অ্যামোলেড ব্লুটুথ কলিং স্মার্টওয়াচ',
  'muba-ultra-2-amoled-smartwatch',
  3250, 4500, 28, 'HOT DEAL', 4.9, 84, 45,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
  '2.04" Super AMOLED ডিসপ্লে, ওয়্যারলেস চার্জিং, ব্লুটুথ এইচডি কলিং ও ৭ দিনের দীর্ঘ ব্যাটারি লাইফ।',
  true, true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'muba-ultra-2-amoled-smartwatch');

INSERT INTO public.products (name, name_bn, slug, price, old_price, discount_percent, badge, rating, review_count, stock, image_url, images, short_description, is_featured, is_flash_sale)
SELECT 
  'Muba Pro Bass ANC Wireless Earbuds',
  'মুবা প্রো বাস অ্যাক্টিভ নয়েজ ক্যানসেলিং ওয়্যারলেস ইয়ারবাড',
  'muba-pro-bass-anc-earbuds',
  2150, 2990, 28, 'BESTSELLER', 4.8, 120, 60,
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'],
  '40dB হাইব্রিড অ্যাক্টিভ নয়েজ ক্যান্সেলেশন, কোয়াড মাইক ক্রিস্টাল কলিং এবং ৩৮ ঘণ্টার মোট প্লেটাইম।',
  true, true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'muba-pro-bass-anc-earbuds');

-- 16. RELOAD PostgREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- DONE! All tables, policies, buckets, and seeds are ready.
