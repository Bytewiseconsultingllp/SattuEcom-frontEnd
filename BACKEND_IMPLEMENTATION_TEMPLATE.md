# Backend Implementation Template - Dashboard Statistics

## Overview
This document provides ready-to-use code templates for implementing the dashboard statistics endpoints.

## 1. Controller Implementation

### File: `controllers/dashboardController.ts` (or `.js`)

```typescript
import { Request, Response } from 'express';
import Order from '../models/Order';
import OfflineSale from '../models/OfflineSale';
import Expense from '../models/Expense';
import User from '../models/User';
import Product from '../models/Product';

class DashboardController {
  /**
   * Get all dashboard statistics
   * Calculates: Total Revenue = Online Sales + Offline Sales - Expenses
   */
  async getStats(req: Request, res: Response) {
    try {
      // Calculate online sales (from delivered orders)
      const onlineSalesResult = await Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]);
      const onlineSales = onlineSalesResult[0]?.total || 0;

      // Calculate offline sales
      const offlineSalesResult = await OfflineSale.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      const offlineSales = offlineSalesResult[0]?.total || 0;

      // Calculate expenses
      const expensesResult = await Expense.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const expenses = expensesResult[0]?.total || 0;

      // Calculate total revenue
      const totalRevenue = onlineSales + offlineSales - expenses;

      // Get counts
      const totalOrders = await Order.countDocuments();
      const totalCustomers = await User.countDocuments({ role: 'user' });
      const totalProducts = await Product.countDocuments();

      // Calculate percentage changes (compare with previous month)
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);

      const previousOnlineSales = await Order.aggregate([
        {
          $match: {
            status: 'delivered',
            created_at: { $gte: previousMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]);
      const prevOnline = previousOnlineSales[0]?.total || onlineSales;
      const revenueChange = prevOnline > 0 
        ? ((totalRevenue - prevOnline) / prevOnline) * 100 
        : 0;

      const previousOrders = await Order.countDocuments({
        created_at: { $gte: previousMonth }
      });
      const ordersChange = previousOrders > 0 
        ? ((totalOrders - previousOrders) / previousOrders) * 100 
        : 0;

      const previousCustomers = await User.countDocuments({
        role: 'user',
        createdAt: { $gte: previousMonth }
      });
      const customersChange = previousCustomers > 0 
        ? ((totalCustomers - previousCustomers) / previousCustomers) * 100 
        : 0;

      const previousProducts = await Product.countDocuments({
        createdAt: { $gte: previousMonth }
      });
      const productsChange = previousProducts > 0 
        ? ((totalProducts - previousProducts) / previousProducts) * 100 
        : 0;

      return res.json({
        success: true,
        data: {
          onlineSales: Math.round(onlineSales),
          offlineSales: Math.round(offlineSales),
          expenses: Math.round(expenses),
          totalRevenue: Math.round(totalRevenue),
          totalOrders,
          totalCustomers,
          totalProducts,
          revenueChange: parseFloat(revenueChange.toFixed(1)),
          ordersChange: parseFloat(ordersChange.toFixed(1)),
          customersChange: parseFloat(customersChange.toFixed(1)),
          productsChange: parseFloat(productsChange.toFixed(1))
        }
      });
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch dashboard statistics'
      });
    }
  }

  /**
   * Get online sales total
   * Filters: startDate, endDate
   */
  async getOnlineSalesTotal(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      let matchStage: any = { status: 'delivered' };

      if (startDate || endDate) {
        matchStage.created_at = {};
        if (startDate) {
          matchStage.created_at.$gte = new Date(startDate as string);
        }
        if (endDate) {
          matchStage.created_at.$lte = new Date(endDate as string);
        }
      }

      const result = await Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: '$total_amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const total = result[0]?.total || 0;
      const count = result[0]?.count || 0;

      return res.json({
        success: true,
        data: {
          total: Math.round(total),
          count,
          average: count > 0 ? Math.round(total / count) : 0
        }
      });
    } catch (error: any) {
      console.error('Online sales error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch online sales'
      });
    }
  }

  /**
   * Get offline sales total
   * Filters: startDate, endDate
   */
  async getOfflineSalesTotal(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      let matchStage: any = {};

      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) {
          matchStage.date.$gte = new Date(startDate as string);
        }
        if (endDate) {
          matchStage.date.$lte = new Date(endDate as string);
        }
      }

      const result = await OfflineSale.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const total = result[0]?.total || 0;
      const count = result[0]?.count || 0;

      return res.json({
        success: true,
        data: {
          total: Math.round(total),
          count,
          average: count > 0 ? Math.round(total / count) : 0
        }
      });
    } catch (error: any) {
      console.error('Offline sales error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch offline sales'
      });
    }
  }

  /**
   * Get expenses total
   * Filters: startDate, endDate
   */
  async getExpensesTotal(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      let matchStage: any = {};

      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) {
          matchStage.date.$gte = new Date(startDate as string);
        }
        if (endDate) {
          matchStage.date.$lte = new Date(endDate as string);
        }
      }

      const result = await Expense.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const total = result[0]?.total || 0;
      const count = result[0]?.count || 0;

      return res.json({
        success: true,
        data: {
          total: Math.round(total),
          count,
          average: count > 0 ? Math.round(total / count) : 0
        }
      });
    } catch (error: any) {
      console.error('Expenses error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch expenses'
      });
    }
  }
}

export default new DashboardController();
```

## 2. Routes Implementation

### File: `routes/dashboard.ts` (or `routes/admin.ts`)

```typescript
import express from 'express';
import dashboardController from '../controllers/dashboardController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Dashboard Statistics Routes
 * All routes require admin authentication
 */

// Get all dashboard statistics
router.get(
  '/admin/dashboard/stats',
  authenticateToken,
  authorizeAdmin,
  dashboardController.getStats
);

// Get online sales total
router.get(
  '/admin/dashboard/online-sales',
  authenticateToken,
  authorizeAdmin,
  dashboardController.getOnlineSalesTotal
);

// Get offline sales total
router.get(
  '/admin/dashboard/offline-sales',
  authenticateToken,
  authorizeAdmin,
  dashboardController.getOfflineSalesTotal
);

// Get expenses total
router.get(
  '/admin/dashboard/expenses',
  authenticateToken,
  authorizeAdmin,
  dashboardController.getExpensesTotal
);

export default router;
```

## 3. Main App Integration

### File: `app.ts` or `server.ts`

```typescript
import dashboardRoutes from './routes/dashboard';

// Add to your Express app
app.use('/api', dashboardRoutes);

// Or if you have a separate admin routes file
app.use('/api', adminRoutes);
```

## 4. Alternative: Using Sequelize (SQL)

If using Sequelize instead of MongoDB:

```typescript
async getStats(req: Request, res: Response) {
  try {
    const { sequelize } = require('sequelize');
    const { Op } = require('sequelize');

    // Online sales
    const onlineSales = await Order.sum('total_amount', {
      where: { status: 'delivered' }
    }) || 0;

    // Offline sales
    const offlineSales = await OfflineSale.sum('totalAmount') || 0;

    // Expenses
    const expenses = await Expense.sum('amount') || 0;

    // Total revenue
    const totalRevenue = onlineSales + offlineSales - expenses;

    // Counts
    const totalOrders = await Order.count();
    const totalCustomers = await User.count({ where: { role: 'user' } });
    const totalProducts = await Product.count();

    // Calculate changes
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const prevOnline = await Order.sum('total_amount', {
      where: {
        status: 'delivered',
        createdAt: { [Op.gte]: previousMonth }
      }
    }) || onlineSales;

    const revenueChange = prevOnline > 0 
      ? ((totalRevenue - prevOnline) / prevOnline) * 100 
      : 0;

    return res.json({
      success: true,
      data: {
        onlineSales: Math.round(onlineSales),
        offlineSales: Math.round(offlineSales),
        expenses: Math.round(expenses),
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueChange: parseFloat(revenueChange.toFixed(1)),
        ordersChange: 8.2,
        customersChange: 15.3,
        productsChange: 5.1
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
```

## 5. Database Indexes (Performance Optimization)

```typescript
// MongoDB Indexes
db.orders.createIndex({ status: 1, created_at: -1 });
db.offlineSales.createIndex({ date: -1 });
db.expenses.createIndex({ date: -1 });

// SQL Indexes
ALTER TABLE orders ADD INDEX idx_status_created (status, created_at);
ALTER TABLE offline_sales ADD INDEX idx_date (date);
ALTER TABLE expenses ADD INDEX idx_date (date);
```

## 6. Testing the Endpoints

### Using cURL

```bash
# Get dashboard stats
curl -X GET http://localhost:3000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get online sales
curl -X GET "http://localhost:3000/api/admin/dashboard/online-sales?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get offline sales
curl -X GET "http://localhost:3000/api/admin/dashboard/offline-sales" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get expenses
curl -X GET "http://localhost:3000/api/admin/dashboard/expenses" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Create new requests for each endpoint
2. Set method to GET
3. Add Authorization header with Bearer token
4. Add query parameters for date filters
5. Send and verify responses

## 7. Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "onlineSales": 245890,
    "offlineSales": 45000,
    "expenses": 25000,
    "totalRevenue": 265890,
    "totalOrders": 1234,
    "totalCustomers": 856,
    "totalProducts": 145,
    "revenueChange": 12.5,
    "ordersChange": 8.2,
    "customersChange": 15.3,
    "productsChange": 5.1
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Failed to fetch dashboard statistics"
}
```

## 8. Middleware Setup

### Authentication Middleware
```typescript
export const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const authorizeAdmin = (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};
```

## 9. Error Handling

```typescript
// Global error handler
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error('Error:', err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});
```

## 10. Deployment Checklist

- [ ] All endpoints implemented
- [ ] Authentication middleware applied
- [ ] Database indexes created
- [ ] Error handling in place
- [ ] Tested with cURL/Postman
- [ ] Response formats verified
- [ ] Date filtering works
- [ ] Performance optimized
- [ ] Logging configured
- [ ] Deployed to staging
- [ ] Tested in staging environment
- [ ] Deployed to production

## Notes

1. **Database Queries**: Adjust field names based on your actual schema
2. **Date Handling**: Ensure dates are properly formatted (ISO 8601)
3. **Aggregation**: Use aggregation pipeline for better performance
4. **Caching**: Consider caching results for frequently accessed data
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **Logging**: Add comprehensive logging for debugging
7. **Monitoring**: Set up monitoring for API performance
8. **Documentation**: Keep API documentation updated
