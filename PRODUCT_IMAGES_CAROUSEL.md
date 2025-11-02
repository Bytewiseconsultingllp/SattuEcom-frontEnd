# Product Images Carousel Implementation

## Overview
The product card and product detail pages now support multiple images with an interactive carousel. Users can browse through multiple product images if available, or see a single default image.

## Features Implemented

### 1. ProductCard Component (`src/components/ProductCard.tsx`)
- ✅ Displays carousel when multiple images are available
- ✅ Shows single image when only one image exists
- ✅ Falls back to placeholder image when no images are provided
- ✅ Carousel navigation buttons appear on hover
- ✅ Prevents carousel navigation from triggering card link

### 2. ProductDetail Page (`src/pages/ProductDetail.tsx`)
- ✅ Large carousel for product detail view (500px height)
- ✅ Always visible navigation buttons
- ✅ Loops through images infinitely
- ✅ Same fallback logic as ProductCard

## Backend Data Structure

Your backend should return products with the following structure:

```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "name": "Product Name",
    "price": 299,
    "originalPrice": 399,
    "image_url": "https://example.com/main-image.jpg",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg"
    ],
    "category": "Category Name",
    "rating": 4.5,
    "reviews_count": 120,
    "in_stock": true,
    "description": "Product description",
    "benefits": ["Benefit 1", "Benefit 2"],
    "ingredients": "List of ingredients",
    "usage": "How to use"
  }
}
```

### Key Fields for Images:
- **`image_url`** (string, required): Primary/fallback image URL
- **`images`** (array, optional): Array of image URLs for carousel
  - If `images` array has 2+ items → Carousel is shown
  - If `images` array has 1 item → Single image is shown
  - If `images` is empty/null → Falls back to `image_url`
  - If both are missing → Shows `/placeholder.svg`

## Image Priority Logic

```
1. Check if `images` array exists and has items
   ├─ YES → Use `images` array
   └─ NO → Check if `image_url` exists
       ├─ YES → Use `image_url` as single image
       └─ NO → Use `/placeholder.svg`

2. Determine display mode
   ├─ Multiple images (length > 1) → Show carousel
   └─ Single image (length = 1) → Show static image
```

## UI/UX Features

### ProductCard (All Products Page)
- Carousel navigation buttons (prev/next) appear on hover
- Small navigation buttons (6x6)
- Smooth transitions and hover effects
- Image zoom effect on card hover
- Badges (discount, out of stock) have z-index to stay on top

### ProductDetail Page
- Large carousel (500px height)
- Always visible navigation buttons
- Positioned at left-4 and right-4
- Infinite loop enabled
- Better viewing experience for detailed product inspection

## Testing Checklist

- [ ] Product with multiple images shows carousel
- [ ] Product with single image shows static image
- [ ] Product with no images shows placeholder
- [ ] Carousel navigation works (prev/next buttons)
- [ ] Carousel loops infinitely
- [ ] Clicking carousel buttons doesn't navigate to product detail
- [ ] Hover effects work correctly
- [ ] Badges stay visible on top of carousel
- [ ] Mobile responsive (carousel works on touch devices)

## Dependencies Used

- `embla-carousel-react` - Already installed in package.json
- `@/components/ui/carousel` - shadcn/ui carousel component
- Lucide React icons for navigation arrows

## Notes for Backend Team

1. **Image URLs**: Ensure all image URLs are publicly accessible
2. **Array Order**: First image in `images` array is shown first
3. **Fallback**: Always provide `image_url` as fallback even if `images` array exists
4. **Performance**: Consider image optimization/CDN for faster loading
5. **Validation**: Validate image URLs before saving to database

## Example Backend Response

### Product with Multiple Images
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Premium Sattu Powder",
    "image_url": "https://cdn.example.com/sattu-main.jpg",
    "images": [
      "https://cdn.example.com/sattu-front.jpg",
      "https://cdn.example.com/sattu-back.jpg",
      "https://cdn.example.com/sattu-ingredients.jpg",
      "https://cdn.example.com/sattu-usage.jpg"
    ],
    "price": 299,
    "in_stock": true
  }
}
```

### Product with Single Image
```json
{
  "success": true,
  "data": {
    "id": "124",
    "name": "Basic Sattu",
    "image_url": "https://cdn.example.com/basic-sattu.jpg",
    "images": [],
    "price": 199,
    "in_stock": true
  }
}
```
