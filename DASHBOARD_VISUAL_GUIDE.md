# User Dashboard - Visual Design Guide

## Dashboard Layout Structure

```
┌────────────────────────────────────────────────────────────────────┐
│                    USER DASHBOARD OVERVIEW                         │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  Welcome back, John! 👋                                            │
│  Here's what's happening with your store today                     │
│                                                  [View Reports BTN] │
│  (Blue to Indigo Gradient Background)                              │
└────────────────────────────────────────────────────────────────────┘

REVENUE METRICS ROW (NEW)
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ 💵 Total Revenue │ 🛒 Online Sales  │ 📦 Offline Sales │ ⚠️  Expenses      │
│                  │                  │                  │                  │
│   ₹265,890       │   ₹245,890       │    ₹45,000       │    ₹25,000       │
│   +12.5% ↑       │    +8.2% ↑       │    +5.1% ↑       │    -3.2% ↓       │
│                  │                  │                  │                  │
│ (Green)          │ (Blue)           │ (Purple)         │ (Orange/Red)     │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘

ORDER METRICS ROW (EXISTING)
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ 📦 Total Orders  │ ⏱️  Active Orders │ ✅ Completed Ord │ 💳 Total Spent   │
│                  │                  │                  │                  │
│      1,234       │       45         │      1,189       │   ₹45,890        │
│                  │  45 Active       │                  │                  │
│                  │                  │                  │                  │
│ (Blue)           │ (Yellow)         │ (Green)          │ (Purple)         │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘

RECENT ORDERS & PAYMENTS
┌──────────────────────────────────────────┬──────────────────────────────┐
│  Recent Orders                           │  Quick Actions               │
│  • Order #ABC123 - ₹1,250 - Delivered   │  📦 My Orders                │
│  • Order #DEF456 - ₹890 - Processing    │  ❤️  Wishlist (5)            │
│  • Order #GHI789 - ₹2,100 - Shipped     │  📍 Manage Addresses         │
│                                          │  💳 Payment History          │
│  [View All]                              │                              │
├──────────────────────────────────────────┼──────────────────────────────┤
│  Recent Payments                         │  Account Info                │
│  • Payment #PAY001 - ₹899 - Paid        │  Member Since: Jan 15, 2025  │
│  • Payment #PAY002 - ₹449 - Paid        │  Email: john@example.com     │
│  • Payment #PAY003 - ₹1,299 - Pending   │  Status: ✅ Verified         │
│                                          │  [View Profile]              │
│  [View All]                              │                              │
└──────────────────────────────────────────┴──────────────────────────────┘
```

## Card Component Anatomy

### Revenue Card Example (Total Revenue)

```
┌─────────────────────────────────┐
│  💵                    +12.5% ↑  │  ← Icon & Badge
│                                 │
│  ₹265,890                       │  ← Main Value
│  Total Revenue                  │  ← Label
│                                 │
│  [Hover Effect: Shadow]         │
└─────────────────────────────────┘

Colors:
- Icon Container: bg-green-100
- Icon: text-green-600
- Badge: bg-green-100, text-green-700
- Border: Subtle on hover
```

### Order Card Example (Active Orders)

```
┌─────────────────────────────────┐
│  ⏱️                 45 Active    │  ← Icon & Badge
│                                 │
│  45                             │  ← Main Value
│  Active Orders                  │  ← Label
│                                 │
│  [Track orders →]               │  ← Action Link
└─────────────────────────────────┘

Colors:
- Icon Container: bg-yellow-100
- Icon: text-yellow-600
- Badge: Secondary variant
```

## Color Palette

### Revenue Cards
```
Total Revenue (Green)
├─ Icon Container: #dbeafe (bg-green-100)
├─ Icon: #059669 (text-green-600)
├─ Badge: #dbeafe / #047857 (bg-green-100 / text-green-700)
└─ Arrow: ↑ (ArrowUpRight)

Online Sales (Blue)
├─ Icon Container: #dbeafe (bg-blue-100)
├─ Icon: #2563eb (text-blue-600)
├─ Badge: #dbeafe / #1d4ed8 (bg-blue-100 / text-blue-700)
└─ Arrow: ↑ (ArrowUpRight)

Offline Sales (Purple)
├─ Icon Container: #ede9fe (bg-purple-100)
├─ Icon: #7c3aed (text-purple-600)
├─ Badge: #ede9fe / #6d28d9 (bg-purple-100 / text-purple-700)
└─ Arrow: ↑ (ArrowUpRight)

Expenses (Orange/Red)
├─ Icon Container: #fed7aa (bg-orange-100)
├─ Icon: #ea580c (text-orange-600)
├─ Badge: #fee2e2 / #dc2626 (bg-red-100 / text-red-700)
└─ Arrow: ↓ (ArrowDownRight)
```

### Order Cards
```
Total Orders (Blue)
├─ Icon: #2563eb (text-blue-600)
└─ Trend: #16a34a (text-green-600)

Active Orders (Yellow)
├─ Icon: #ca8a04 (text-yellow-600)
└─ Badge: Secondary

Completed Orders (Green)
├─ Icon: #16a34a (text-green-600)
└─ No badge

Total Spent (Purple)
├─ Icon: #7c3aed (text-purple-600)
└─ No badge
```

## Responsive Breakpoints

### Mobile (< 768px)
```
┌──────────────────┐
│  Card 1          │
├──────────────────┤
│  Card 2          │
├──────────────────┤
│  Card 3          │
├──────────────────┤
│  Card 4          │
├──────────────────┤
│  Card 5          │
├──────────────────┤
│  Card 6          │
├──────────────────┤
│  Card 7          │
├──────────────────┤
│  Card 8          │
└──────────────────┘

Grid: grid-cols-1
```

### Tablet (768px - 1024px)
```
┌──────────────────┬──────────────────┐
│  Card 1          │  Card 2          │
├──────────────────┼──────────────────┤
│  Card 3          │  Card 4          │
├──────────────────┼──────────────────┤
│  Card 5          │  Card 6          │
├──────────────────┼──────────────────┤
│  Card 7          │  Card 8          │
└──────────────────┴──────────────────┘

Grid: md:grid-cols-2
```

### Desktop (> 1024px)
```
┌──────────┬──────────┬──────────┬──────────┐
│ Card 1   │ Card 2   │ Card 3   │ Card 4   │
├──────────┼──────────┼──────────┼──────────┤
│ Card 5   │ Card 6   │ Card 7   │ Card 8   │
└──────────┴──────────┴──────────┴──────────┘

Grid: lg:grid-cols-4
```

## Typography Hierarchy

```
Welcome Section
├─ Heading: text-3xl font-bold
│  "Welcome back, John! 👋"
│
└─ Subheading: text-blue-100
   "Here's what's happening with your store today"

Card Values
├─ Amount: text-2xl font-bold
│  "₹265,890"
│
└─ Label: text-sm text-muted-foreground
   "Total Revenue"

Badge
└─ Percentage: text-xs font-medium
   "+12.5%"
```

## Spacing & Dimensions

```
Welcome Section
├─ Padding: p-8 (32px)
├─ Border Radius: rounded-xl
└─ Height: Auto (content-based)

Cards
├─ Padding: p-6 (24px)
├─ Border Radius: rounded-lg
├─ Height: Auto (content-based)
└─ Hover: shadow-lg

Grid
├─ Gap: gap-6 (24px)
├─ Columns: 1 / 2 / 4
└─ Max Width: Full

Icons
├─ Container: h-12 w-12 (48px)
├─ Icon: h-6 w-6 (24px)
├─ Border Radius: rounded-full
└─ Background: [color]-100

Badges
├─ Padding: px-2 py-1
├─ Border Radius: rounded-md
├─ Font Size: text-xs
└─ Height: Auto
```

## Interactive States

### Card Hover
```
Default:
├─ Shadow: None
├─ Background: White
└─ Cursor: Default

Hover:
├─ Shadow: shadow-lg
├─ Background: White (no change)
├─ Cursor: Pointer
└─ Transition: transition-shadow
```

### Badge Hover
```
Default:
├─ Background: [color]-100
├─ Text Color: [color]-700
└─ Cursor: Default

Hover:
├─ Background: [color]-100 (no change)
├─ Text Color: [color]-700 (no change)
└─ Cursor: Default
```

### Link Hover
```
Default:
├─ Color: Primary
├─ Text Decoration: None
└─ Cursor: Default

Hover:
├─ Color: Primary (darker)
├─ Text Decoration: Underline
└─ Cursor: Pointer
```

## Animation & Transitions

```
Component Load
├─ Animation: animate-fade-in
├─ Duration: 300ms (default)
└─ Easing: Ease-in-out

Card Hover
├─ Property: shadow
├─ Duration: 200ms
└─ Easing: Ease-in-out

Skeleton Loading
├─ Animation: pulse
├─ Duration: 2s
└─ Easing: Ease-in-out
```

## Accessibility Features

```
Semantic HTML
├─ <Card> for containers
├─ <Badge> for status indicators
├─ <Button> for actions
└─ Proper heading hierarchy

Color Contrast
├─ Text: WCAG AA compliant
├─ Icons: Sufficient contrast
└─ Badges: Readable on background

Focus States
├─ Visible focus indicators
├─ Keyboard navigation
└─ Screen reader support

ARIA Labels
├─ Icon descriptions
├─ Badge meanings
└─ Action buttons
```

## Example: Revenue Card Breakdown

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  💵                      +12.5% ↑    │   │  ← Header (flex between)
│  └─────────────────────────────────────┘   │
│                                             │
│  ₹265,890                                   │  ← Main value (text-2xl bold)
│  Total Revenue                              │  ← Label (text-sm muted)
│                                             │
│  Padding: 24px (p-6)                        │
│  Border Radius: rounded-lg                  │
│  Hover Shadow: shadow-lg                    │
│                                             │
└─────────────────────────────────────────────┘

Icon Details:
├─ Container: 48x48px, rounded-full
├─ Background: bg-green-100
├─ Icon: DollarSign, 24x24px, text-green-600
└─ Alignment: Flex left

Badge Details:
├─ Background: bg-green-100
├─ Text: text-green-700
├─ Content: <ArrowUpRight/> 12.5%
└─ Alignment: Flex right
```

## Loading State

```
┌─────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Skeleton
│                                         │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Skeleton
│                                         │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Skeleton
│                                         │
└─────────────────────────────────────────┘

Animation: Pulse effect
Duration: 2 seconds
Repeat: Infinite
```

## Error State

```
⚠️ Failed to load dashboard data

[Retry Button]

Or show last known values with:
├─ Reduced opacity
├─ Error badge
└─ Retry action
```

## Success State

```
✅ All data loaded successfully

Display all 8 cards with:
├─ Full opacity
├─ Smooth animations
├─ Interactive hover states
└─ Clickable links
```
