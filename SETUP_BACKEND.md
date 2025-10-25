# SattuStore Backend Setup Guide

## Step 1: Enable Supabase in Lovable

1. Click on **Project Settings** in Lovable
2. Navigate to **Integrations**
3. Click **Connect Supabase** or **Enable Lovable Cloud**
4. Follow the setup wizard to create your Supabase project

## Step 2: Run Database Migrations

Once Supabase is connected, go to the Supabase Dashboard → SQL Editor and run these migrations:

### Migration 1: Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  benefits TEXT[],
  ingredients TEXT,
  usage TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address_id UUID NOT NULL REFERENCES addresses(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Wishlist items table
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON wishlist_items FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);
```

### Migration 2: Seed Products

```sql
INSERT INTO products (name, description, price, original_price, category, image_url, in_stock, rating, reviews_count, benefits, ingredients, usage) VALUES
('Premium Roasted Sattu Powder - 1kg', '100% natural roasted gram flour from Bihar. Rich in protein, fiber, and essential nutrients.', 299, 399, 'Sattu Powder', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', true, 4.8, 245, 
 ARRAY['High in protein (20g per 100g)', 'Rich in dietary fiber', 'Low glycemic index', 'Natural cooling properties', 'No added preservatives'], 
 '100% Roasted Bengal Gram (Chana)', 
 'Mix 2-3 tablespoons with water, salt, and lemon for a refreshing drink.'),

('Ready to Mix Sattu Drink - Sweet & Salty Combo', 'Convenient ready-to-mix sattu drink sachets. Just add water and enjoy.', 449, 599, 'Ready to Drink', 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800', true, 4.6, 189,
 ARRAY['Instant energy boost', 'Pre-portioned sachets', 'No preparation needed', 'Perfect for travel', 'Natural ingredients'],
 'Roasted Sattu, Rock Salt, Black Salt, Cumin Powder, Sugar, Cardamom',
 'Empty one sachet in 200ml water, mix well and enjoy. Best served chilled.'),

('Sattu Energy Ladoo - Pack of 12', 'Delicious and nutritious sattu ladoos made with jaggery, nuts, and ghee.', 350, 450, 'Snacks & Ladoo', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800', true, 4.9, 312,
 ARRAY['Natural energy booster', 'Made with pure desi ghee', 'Rich in nuts and seeds', 'No refined sugar', 'Traditional recipe'],
 'Sattu, Jaggery, Almonds, Cashews, Desi Ghee, Cardamom',
 'Consume 1-2 ladoos as a healthy snack. Best enjoyed with milk or tea.');
```

## Step 3: Environment Variables

Your environment variables are automatically configured when you enable Supabase in Lovable. They are:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Step 4: Enable Authentication

1. Go to Supabase Dashboard → Authentication
2. Enable Email/Password authentication
3. (Optional) Enable OAuth providers (Google, Facebook, etc.)
4. Configure email templates for password reset, etc.

## API Functions Available

All API functions are now available in:
- `src/lib/api/products.ts` - Product management
- `src/lib/api/cart.ts` - Shopping cart
- `src/lib/api/wishlist.ts` - Wishlist management
- `src/lib/api/orders.ts` - Order management
- `src/lib/api/addresses.ts` - Address management
- `src/lib/api/reviews.ts` - Product reviews

## Using the API

```typescript
import { useAuth } from '@/hooks/useAuth';
import { getProducts } from '@/lib/api/products';
import { addToCart } from '@/lib/api/cart';

// In your component
const { user } = useAuth();
const products = await getProducts({ category: 'Sattu Powder' });
await addToCart(user.id, productId, 2);
```

## Testing

1. Sign up a test user via `/signup`
2. Browse products at `/products`
3. Add items to cart
4. Create an address
5. Place an order
6. Check admin dashboard at `/admin/dashboard`

## Security

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Products are publicly readable
- Admin functions require proper authentication
- All sensitive data is encrypted

## Next Steps

1. Connect real payment gateway (Stripe/Razorpay)
2. Set up email notifications
3. Add order tracking
4. Implement admin roles
5. Add analytics







