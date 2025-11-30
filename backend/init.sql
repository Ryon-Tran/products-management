-- Run this to create the products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Categories for products
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Link products to categories (optional)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category_id') THEN
    ALTER TABLE products ADD COLUMN category_id INTEGER;
    ALTER TABLE products ADD CONSTRAINT products_category_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Add image_url column if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_url') THEN
    ALTER TABLE products ADD COLUMN image_url TEXT;
  END IF;
END$$;

-- Seed initial categories (idempotent) - Vietnamese names
INSERT INTO categories (name)
VALUES
  ('Nhà'),
  ('Trang trí'),
  ('Nội thất'),
  ('Đèn chiếu sáng'),
  ('Vải & Dệt'),
  ('Ngoài trời'),
  ('Nhà bếp'),
  ('Văn phòng'),
  ('Trẻ em'),
  ('Điện thoai'),
  ('Phụ kiện')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Remove address columns from users table if they exist
ALTER TABLE users DROP COLUMN IF EXISTS address_line1;
ALTER TABLE users DROP COLUMN IF EXISTS address_line2;
ALTER TABLE users DROP COLUMN IF EXISTS city;
ALTER TABLE users DROP COLUMN IF EXISTS state;
ALTER TABLE users DROP COLUMN IF EXISTS postal_code;
ALTER TABLE users DROP COLUMN IF EXISTS country;
ALTER TABLE users DROP COLUMN IF EXISTS phone;

-- User addresses table for multiple addresses per user
CREATE TABLE IF NOT EXISTS addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  label TEXT,
  name TEXT,
  phone TEXT,
  address_line1 TEXT,
  city TEXT,
  district TEXT,
  ward TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Thêm trường district và ward nếu chưa tồn tại
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS ward TEXT;

-- Đổi kiểu id sang BIGINT nếu chưa đúng
ALTER TABLE addresses ALTER COLUMN id TYPE BIGINT;

-- Roles and assignment
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Carts and cart items (one cart per user)
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Orders and order items
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add shipping address columns to orders if missing (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shipping_name') THEN
    ALTER TABLE orders ADD COLUMN shipping_name TEXT;
    ALTER TABLE orders ADD COLUMN shipping_address_line1 TEXT;
    ALTER TABLE orders ADD COLUMN shipping_address_line2 TEXT;
    ALTER TABLE orders ADD COLUMN shipping_city TEXT;
    ALTER TABLE orders ADD COLUMN shipping_state TEXT;
    ALTER TABLE orders ADD COLUMN shipping_postal_code TEXT;
    ALTER TABLE orders ADD COLUMN shipping_country TEXT;
    ALTER TABLE orders ADD COLUMN shipping_phone TEXT;
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);
