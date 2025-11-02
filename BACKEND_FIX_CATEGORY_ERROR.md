# Fix: "Category is not defined" Error

## Problem
Getting 500 Internal Server Error with message: `{"success":false,"message":"Category is not defined"}`

## Root Cause
The error "Category is not defined" means the `Product` model is not imported in your controller file, OR there's an issue with the Product model schema itself.

## Solution

### 1. Check Controller Imports

At the top of your `productController.js` file, ensure you have:

```javascript
const Product = require('../models/Product');
const Category = require('../models/Category');
```

### 2. Verify Product Model Schema

Your Product model should look like this:

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    original_price: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    image_url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    in_stock: {
      type: Boolean,
      default: true,
    },
    ingredients: {
      type: String,
    },
    usage: {
      type: String,
    },
    benefits: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews_count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
```

### 3. Updated Product Controller (Complete)

```javascript
const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Create a new product
 * POST /api/products
 */
exports.createProduct = async (req, res, next) => {
  try {
    const body = { ...req.body };

    // Normalize images array and primary image
    const images = Array.isArray(body.images)
      ? body.images.filter(Boolean)
      : (body.image_url ? [body.image_url] : []);
    
    if (!body.image_url && images.length > 0) {
      body.image_url = images[0];
    }
    body.images = images;

    // Ensure category exists (create if missing)
    const catName = (body.category || '').trim();
    if (!catName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category is required' 
      });
    }
    
    let cat = await Category.findOne({ name: catName }).lean();
    if (!cat) {
      const created = await Category.create({ name: catName });
      cat = created.toObject();
    }

    // Create the product
    const product = await Product.create(body);

    res.status(201).json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    // Pass to error handler middleware
    next(error);
  }
};
```

### 4. Add Error Logging

Add console.error to see the actual error:

```javascript
} catch (error) {
  console.error('Create Product Error:', error);
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({ 
      success: false, 
      message: messages.join(', ') 
    });
  }
  next(error);
}
```

### 5. Check Your Error Handler Middleware

In your main `app.js` or `server.js`, ensure you have an error handler:

```javascript
// Error handling middleware (should be LAST)
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

## Image Handling Note

Your frontend is currently sending **base64 data URIs** instead of URLs. You have two options:

### Option A: Upload Images First (Recommended)
1. Add image upload functionality to convert base64 to actual URLs
2. Use a service like Cloudinary, AWS S3, or similar
3. Send the uploaded URLs to the backend

### Option B: Store Base64 in Database (Not Recommended)
- Allow base64 strings in your schema
- This will make your database very large
- Not suitable for production

## Frontend Image Upload Example (Cloudinary)

```typescript
// Add to your ProductForm
const uploadImage = async (base64Image: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', base64Image);
  formData.append('upload_preset', 'your_upload_preset');
  
  const response = await fetch(
    'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
    {
      method: 'POST',
      body: formData,
    }
  );
  
  const data = await response.json();
  return data.secure_url;
};

// In onSubmit, before sending to backend:
const uploadedImages = await Promise.all(
  data.images.map(img => 
    img.startsWith('data:') ? uploadImage(img) : img
  )
);
```

## Testing Steps

1. **Check server logs** when you submit the form
2. **Verify imports** in productController.js
3. **Test category creation** separately first
4. **Check Product model** exists and is exported correctly
5. **Verify MongoDB connection** is working

## Common Issues

### Issue 1: Model Not Found
```
Error: Cannot find module '../models/Product'
```
**Fix:** Check the path to your Product model file

### Issue 2: Category Not Defined
```
ReferenceError: Category is not defined
```
**Fix:** Add `const Category = require('../models/Category');`

### Issue 3: Validation Error
```
ValidationError: Product validation failed
```
**Fix:** Check which required fields are missing in the request

## Debug Checklist

- [ ] Product model file exists at correct path
- [ ] Category model file exists at correct path
- [ ] Both models are imported in controller
- [ ] MongoDB connection is active
- [ ] Category collection exists in database
- [ ] Request body contains all required fields
- [ ] Image URLs are valid (not base64)
- [ ] Error handler middleware is set up
- [ ] Server logs show actual error message

## Quick Test

Test your category creation endpoint first:

```bash
curl -X POST http://localhost:4000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Category"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Test Category",
    "created_at": "...",
    "updated_at": "..."
  },
  "message": "Category created"
}
```

If this works, then the issue is specifically in the Product creation logic.
