# Admin Login Setup Guide

## Step 1: Enable Supabase

Before you can login, you need to enable Supabase:

1. Go to your Lovable project settings
2. Click on **Integrations**
3. Enable **Lovable Cloud** or **Connect Supabase**
4. Follow the setup wizard

## Step 2: Create Admin User

Once Supabase is enabled:

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** (manually)
4. Create an admin account:
   - Email: `admin@sattustore.com`
   - Password: Choose a secure password (e.g., `Admin123!`)
   - Confirm email: ✅ (check this to skip email verification)

### Option B: Via Signup Page

1. Go to `/signup` in your app
2. Create account with:
   - Name: `Admin`
   - Email: `admin@sattustore.com`
   - Password: Your chosen password
3. Accept terms and sign up

## Step 3: Login

Now you can login:

### Admin Login
- **URL**: `/login`
- **Email**: `admin@sattustore.com`
- **Password**: Your chosen password
- **Redirects to**: `/admin/dashboard` (automatically detects admin email)

### Regular User Login
- **URL**: `/login`
- **Email**: Any other email you create
- **Password**: Your chosen password
- **Redirects to**: `/user/dashboard`

## Step 4: Add More Admin Features (Optional)

To enhance admin capabilities, you can:

### A. Add Admin Role to Database

Run this in Supabase SQL Editor:

```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'customer';

-- Create index for faster queries
CREATE INDEX idx_users_role ON users(role);

-- Update admin user
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@sattustore.com';

-- Add RLS policy for admin operations
CREATE POLICY "Admins can manage all products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update order status" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```

### B. Protect Admin Routes

Create a protected route component:

```typescript
// src/components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    // Add admin role check here if you implemented roles
  }, [user, loading, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <>{children}</>;
};
```

Then wrap your admin route:
```typescript
<Route path="/admin/dashboard" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />
```

## Default Test Credentials

**Admin:**
- Email: `admin@sattustore.com`
- Password: (You set this when creating the user)

**Regular User:**
- Create any account via `/signup`

## Troubleshooting

### "Failed to login"
- ✅ Check Supabase is enabled in project settings
- ✅ Verify you created the user in Supabase
- ✅ Make sure email is confirmed (or skip verification when creating)
- ✅ Check browser console for errors

### "Can't access admin dashboard"
- ✅ Make sure you're logged in with `admin@sattustore.com`
- ✅ Check the login redirect logic in `/src/pages/Login.tsx`
- ✅ Try logging out and back in

### Email not verified
- Go to Supabase Dashboard → Authentication → Users
- Click on your user
- Click "Confirm email"

## Next Steps

1. Enable Supabase ✅
2. Create admin user ✅
3. Login and test ✅
4. Add more products via admin dashboard
5. Test order flow
6. Customize admin permissions
