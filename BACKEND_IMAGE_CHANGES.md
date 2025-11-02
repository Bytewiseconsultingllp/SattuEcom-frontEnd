# Backend Changes for Image Upload System

## Overview
The frontend now uses a single `images` array field (base64 format) instead of separate `image_url` and `images` fields.

## Required Backend Changes

### 1. Update Product Model Schema

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
    // CHANGED: Only images array, no image_url
    images: {
      type: [String], // Array of base64 strings
      required: [true, 'At least one image is required'],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one image is required'
      }
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

### 2. Update Product Controller - createProduct

```javascript
const Product = require('../models/Product');
const Category = require('../models/Category');

exports.createProduct = async (req, res, next) => {
  try {
    const body = { ...req.body };

    // Validate images array
    if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one image is required' 
      });
    }

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

    // Create the product with images array
    const product = await Product.create({
      name: body.name,
      price: body.price,
      original_price: body.original_price,
      category: body.category,
      description: body.description,
      images: body.images, // Array of base64 strings
      in_stock: body.in_stock,
      ingredients: body.ingredients,
      usage: body.usage,
      benefits: body.benefits || [],
    });

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
    
    next(error);
  }
};
```

### 3. Update Product Controller - updateProduct

```javascript
exports.updateProduct = async (req, res, next) => {
  try {
    const body = { ...req.body };

    // If images provided, validate
    if (body.images !== undefined) {
      if (!Array.isArray(body.images) || body.images.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'At least one image is required' 
        });
      }
    }

    // If category changed, ensure it exists
    if (typeof body.category === 'string') {
      const catName = body.category.trim();
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
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    next(error);
  }
};
```

### 4. Update getProducts Controller

```javascript
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    
    // Products already have images array, no transformation needed
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    next(error);
  }
};
```

### 5. Update getProductById Controller

```javascript
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    next(error);
  }
};
```

## Migration Script (Optional)

If you have existing products with `image_url` field, run this migration:

```javascript
// migration-script.js
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function migrateProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const products = await Product.find({});
    
    for (const product of products) {
      // If product has image_url but no images array
      if (product.image_url && (!product.images || product.images.length === 0)) {
        product.images = [product.image_url];
        await product.save();
        console.log(`Migrated product: ${product.name}`);
      }
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateProducts();
```

Run with: `node migration-script.js`

## Request/Response Format

### Create Product Request
```json
{
  "name": "Premium Sattu Powder",
  "price": 299,
  "original_price": 399,
  "category": "Organic",
  "description": "High quality sattu powder",
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
  ],
  "in_stock": true,
  "ingredients": "Roasted gram flour",
  "usage": "Mix with water or milk",
  "benefits": ["High protein", "Energy boost"]
}
```

### Response
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium Sattu Powder",
    "price": 299,
    "original_price": 399,
    "category": "Organic",
    "description": "High quality sattu powder",
    "images": [
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
    ],
    "in_stock": true,
    "ingredients": "Roasted gram flour",
    "usage": "Mix with water or milk",
    "benefits": ["High protein", "Energy boost"],
    "rating": 0,
    "reviews_count": 0,
    "createdAt": "2025-11-02T00:00:00.000Z",
    "updatedAt": "2025-11-02T00:00:00.000Z"
  }
}
```

## Important Notes

### Base64 Storage Considerations

**Pros:**
- Simple implementation
- No external dependencies
- Works immediately

**Cons:**
- Large database size (base64 is ~33% larger than binary)
- Slower queries
- Not suitable for high-traffic production

### Production Recommendation

For production, consider:
1. **Cloudinary** - Free tier, easy integration
2. **AWS S3** - Scalable, pay-as-you-go
3. **Azure Blob Storage** - Good for enterprise

### Example Cloudinary Integration (Future Enhancement)

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadBase64ToCloudinary(base64String) {
  const result = await cloudinary.uploader.upload(base64String, {
    folder: 'products',
    resource_type: 'image'
  });
  return result.secure_url;
}

// In createProduct controller:
const uploadedImages = await Promise.all(
  body.images.map(img => uploadBase64ToCloudinary(img))
);
body.images = uploadedImages; // Now URLs instead of base64
```

## Testing

### Test Create Product
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 100,
    "category": "Test",
    "description": "Test description",
    "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."],
    "in_stock": true
  }'
```

### Test Get Products
```bash
curl http://localhost:4000/api/products
```

## Summary of Changes

1. ✅ Removed `image_url` field from Product model
2. ✅ Made `images` array required with validation
3. ✅ Updated createProduct to handle images array
4. ✅ Updated updateProduct to validate images array
5. ✅ Simplified getProducts (no transformation needed)
6. ✅ Frontend sends base64 images in array format
7. ✅ First image in array is considered primary image

## Deployment Checklist

- [ ] Update Product model schema
- [ ] Update all product controllers
- [ ] Run migration script (if needed)
- [ ] Test create product endpoint
- [ ] Test update product endpoint
- [ ] Test get products endpoint
- [ ] Verify images display correctly in frontend
- [ ] Monitor database size
- [ ] Plan migration to cloud storage (if needed)
