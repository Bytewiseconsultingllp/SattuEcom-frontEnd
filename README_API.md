# SattuStore API Documentation

## Database Schema

### Tables

#### 1. **users**
Extends Supabase auth.users
- `id` (UUID, PK) - References auth.users
- `email` (TEXT, UNIQUE, NOT NULL)
- `full_name` (TEXT)
- `phone` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### 2. **products**
- `id` (UUID, PK)
- `name` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `price` (DECIMAL(10,2), NOT NULL)
- `original_price` (DECIMAL(10,2))
- `category` (TEXT, NOT NULL)
- `image_url` (TEXT, NOT NULL)
- `in_stock` (BOOLEAN, DEFAULT true)
- `rating` (DECIMAL(2,1), DEFAULT 0)
- `reviews_count` (INTEGER, DEFAULT 0)
- `benefits` (TEXT[])
- `ingredients` (TEXT)
- `usage` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### 3. **addresses**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `label` (TEXT, NOT NULL)
- `full_name` (TEXT, NOT NULL)
- `phone` (TEXT, NOT NULL)
- `address_line1` (TEXT, NOT NULL)
- `address_line2` (TEXT)
- `city` (TEXT, NOT NULL)
- `state` (TEXT, NOT NULL)
- `postal_code` (TEXT, NOT NULL)
- `country` (TEXT, DEFAULT 'India')
- `is_default` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### 4. **orders**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `total_amount` (DECIMAL(10,2), NOT NULL)
- `status` (TEXT, CHECK: pending/processing/shipped/delivered/cancelled)
- `shipping_address_id` (UUID, FK → addresses)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### 5. **order_items**
- `id` (UUID, PK)
- `order_id` (UUID, FK → orders)
- `product_id` (UUID, FK → products)
- `quantity` (INTEGER, NOT NULL)
- `price` (DECIMAL(10,2), NOT NULL)
- `created_at` (TIMESTAMPTZ)

#### 6. **cart_items**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `product_id` (UUID, FK → products)
- `quantity` (INTEGER, DEFAULT 1)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- UNIQUE(user_id, product_id)

#### 7. **wishlist_items**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `product_id` (UUID, FK → products)
- `created_at` (TIMESTAMPTZ)
- UNIQUE(user_id, product_id)

#### 8. **reviews**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `product_id` (UUID, FK → products)
- `rating` (INTEGER, CHECK: 1-5)
- `comment` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- UNIQUE(user_id, product_id)

## API Functions

### Authentication
- `useAuth()` - Hook for auth state
- `signIn(email, password)`
- `signUp(email, password, fullName)`
- `signOut()`

### Products
- `getProducts(filters?)` - Get all products with optional filters
- `getProductById(id)` - Get single product
- `createProduct(product)` - Admin only
- `updateProduct(id, updates)` - Admin only
- `deleteProduct(id)` - Admin only

### Cart
- `getCartItems(userId)` - Get user's cart
- `addToCart(userId, productId, quantity)`
- `updateCartItemQuantity(itemId, quantity)`
- `removeFromCart(itemId)`
- `clearCart(userId)`

### Wishlist
- `getWishlistItems(userId)` - Get user's wishlist
- `addToWishlist(userId, productId)`
- `removeFromWishlist(itemId)`
- `isInWishlist(userId, productId)`

### Orders
- `getOrders(userId)` - Get user's orders
- `getOrderById(orderId)` - Get single order
- `createOrder(order)` - Create new order
- `updateOrderStatus(orderId, status)` - Admin only
- `getAllOrders()` - Admin only

### Addresses
- `getAddresses(userId)` - Get user's addresses
- `getAddressById(addressId)`
- `createAddress(address)`
- `updateAddress(addressId, updates)`
- `deleteAddress(addressId)`
- `setDefaultAddress(userId, addressId)`

### Reviews
- `getProductReviews(productId)` - Get product reviews
- `createReview(review)` - Create review
- `updateReview(reviewId, updates)` - Update own review
- `deleteReview(reviewId)` - Delete own review

## Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only access their own data (cart, wishlist, orders, addresses)
- Products are publicly readable
- Reviews are publicly readable but only editable by owner
- Admin functions require proper authentication

## Setup Instructions

1. **Enable Supabase in Lovable**
2. **Run migrations** in the Supabase SQL editor
3. **Configure environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Seed products** using migration 002

## Usage Examples

```typescript
// Get products with filters
const products = await getProducts({
  category: 'Sattu Powder',
  minPrice: 200,
  maxPrice: 500,
  inStockOnly: true
});

// Add to cart
await addToCart(userId, productId, 2);

// Create order
await createOrder({
  user_id: userId,
  total_amount: 899,
  shipping_address_id: addressId,
  items: [
    { product_id: '1', quantity: 2, price: 299 }
  ]
});
```

## Security Notes

- All API calls are authenticated via Supabase Auth
- Row Level Security prevents unauthorized data access
- Admin functions require proper role setup
- Passwords are never stored in plain text
- All sensitive operations are logged
