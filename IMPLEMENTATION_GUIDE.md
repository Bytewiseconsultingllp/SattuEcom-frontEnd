# Razorpay Payment Integration - Complete Implementation Guide

## ✅ What's Been Created

### Backend Files
1. ✅ `models/Payment.js` - Payment model
2. ✅ `services/razorpayService.js` - Razorpay SDK wrapper
3. ✅ `controllers/paymentController.js` - User payment operations
4. ✅ `controllers/adminPaymentController.js` - Admin payment management
5. ✅ `controllers/webhookController.js` - Webhook handlers
6. ✅ `routes/payments.js` - User payment routes
7. ✅ `routes/adminPayments.js` - Admin payment routes
8. ✅ `routes/webhooks.js` - Webhook routes

### Frontend Files
1. ✅ `src/lib/api/payments.ts` - Payment API functions
2. ✅ `src/hooks/useRazorpay.ts` - Razorpay integration hook
3. ✅ `src/components/PaymentButton.tsx` - Payment button component
4. ✅ `src/pages/OrderReview.tsx` - Updated with payment integration
5. ✅ `src/pages/PaymentSuccess.tsx` - Success page
6. ✅ `src/pages/PaymentFailed.tsx` - Failed page
7. ✅ `src/pages/PaymentPending.tsx` - Pending page
8. ✅ `src/styles/animations.css` - Animation styles
9. ✅ `index.html` - Added Razorpay script

---

## 🚀 Implementation Steps

### Step 1: Backend Setup

#### 1.1 Install Dependencies
```bash
cd backend
npm install razorpay crypto
```

#### 1.2 Environment Variables
Add to `.env`:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
FRONTEND_URL=http://localhost:5173
```

#### 1.3 Update Order Model
Add these fields to your Order model:
```javascript
payment_status: {
  type: String,
  enum: ['pending', 'paid', 'failed', 'refunded'],
  default: 'pending',
},
razorpay_order_id: {
  type: String,
},
paid_at: {
  type: Date,
},
```

#### 1.4 Register Routes in server.js
```javascript
const paymentRoutes = require('./routes/payments');
const adminPaymentRoutes = require('./routes/adminPayments');
const webhookRoutes = require('./routes/webhooks');

// IMPORTANT: Webhook route BEFORE express.json()
app.use('/api/webhooks', webhookRoutes);

// Then add express.json()
app.use(express.json());

// Register payment routes
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
```

---

### Step 2: Frontend Setup

#### 2.1 Import Animations CSS
Add to your `main.tsx` or `App.tsx`:
```typescript
import './styles/animations.css';
```

#### 2.2 Add Routes
Update your router configuration:
```typescript
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailed from "@/pages/PaymentFailed";
import PaymentPending from "@/pages/PaymentPending";

// Add routes
{
  path: "/payment-success",
  element: <PaymentSuccess />,
},
{
  path: "/payment-failed",
  element: <PaymentFailed />,
},
{
  path: "/payment-pending",
  element: <PaymentPending />,
}
```

#### 2.3 Update useRazorpay Hook
Modify the hook to redirect to post-payment pages:

```typescript
// In src/hooks/useRazorpay.ts

handler: async (response: any) => {
  try {
    const verifyResponse = await verifyPayment({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      order_id: orderId,
    });

    if (verifyResponse.success) {
      toast.success('Payment successful!');
      // Redirect to success page
      window.location.href = `/payment-success?order_id=${orderId}&payment_id=${response.razorpay_payment_id}`;
    } else {
      toast.error('Payment verification failed');
      window.location.href = `/payment-failed?order_id=${orderId}&error_description=Verification failed`;
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    toast.error(error.message || 'Payment verification failed');
    window.location.href = `/payment-failed?order_id=${orderId}&error_description=${encodeURIComponent(error.message)}`;
  }
},

// On payment failure
razorpay.on('payment.failed', async (response: any) => {
  try {
    await handlePaymentFailure({
      razorpay_order_id,
      error: {
        code: response.error.code,
        description: response.error.description,
      },
    });
    toast.error(response.error.description || 'Payment failed');
    window.location.href = `/payment-failed?order_id=${orderId}&error_code=${response.error.code}&error_description=${encodeURIComponent(response.error.description)}`;
  } catch (error) {
    console.error('Failed to record payment failure:', error);
  }
});

// On modal dismiss
modal: {
  ondismiss: async () => {
    try {
      await handlePaymentFailure({
        razorpay_order_id,
        error: {
          description: 'Payment cancelled by user',
        },
      });
      toast.info('Payment cancelled');
      window.location.href = `/payment-pending?order_id=${orderId}`;
    } catch (error) {
      console.error('Failed to record payment cancellation:', error);
    }
  },
},
```

---

### Step 3: Razorpay Dashboard Configuration

#### 3.1 Get API Keys
1. Sign up/Login at https://dashboard.razorpay.com/
2. Go to Settings → API Keys
3. Generate Test Keys
4. Copy Key ID and Key Secret

#### 3.2 Configure Webhooks
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `refund.created`
   - `refund.processed`
   - `refund.failed`
   - `order.paid`
4. Copy webhook secret

#### 3.3 Test Mode
- Use test keys (`rzp_test_xxx`)
- Test cards: https://razorpay.com/docs/payments/payments/test-card-details/

---

## 🧪 Testing Guide

### Test Success Flow
```
Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

**Steps:**
1. Add items to cart
2. Complete checkout
3. Click "Place Order & Pay"
4. Enter test card details
5. Complete payment
6. Should redirect to `/payment-success`
7. Verify order details shown
8. Test buttons work

### Test Failed Flow
```
Card: 4000 0000 0000 0002 (Declined card)
```

**Steps:**
1. Follow same steps as success
2. Use failing card
3. Should redirect to `/payment-failed`
4. Verify error details shown
5. Test retry button

### Test Pending Flow
**Steps:**
1. Start payment process
2. Close Razorpay modal without completing
3. Should redirect to `/payment-pending`
4. Verify timer is running

---

## 📊 Payment Flow Diagram

```
User clicks "Place Order & Pay"
           ↓
Backend creates Order (status: pending)
           ↓
Backend creates Razorpay Order
           ↓
Frontend opens Razorpay Checkout
           ↓
    ┌──────┴──────┐
    ↓             ↓
User Pays    User Cancels
    ↓             ↓
Payment     Payment Pending
Success         Page
Page
    ↓
Backend verifies signature
    ↓
Order status → paid
    ↓
Cart cleared
    ↓
Email sent
```

---

## 🔒 Security Checklist

- ✅ Payment signature verification on backend
- ✅ Webhook signature verification
- ✅ HTTPS in production
- ✅ API keys in environment variables
- ✅ User authentication required
- ✅ Order ownership validation
- ✅ Rate limiting on payment endpoints

---

## 📧 Email Notifications

Emails are sent for:
- ✅ Order created
- ✅ Payment successful
- ✅ Order cancelled
- ✅ Refund processed

Configure email service in your backend.

---

## 🎨 Customization

### Colors
Update in post-payment pages:
- Success: `green-600`, `green-100`
- Failed: `red-600`, `red-100`
- Pending: `yellow-600`, `yellow-100`

### Animations
Modify in `src/styles/animations.css`

### Content
Update text in respective page files

---

## 🐛 Troubleshooting

### Payment not working?
1. Check Razorpay keys in `.env`
2. Verify webhook URL is correct
3. Check browser console for errors
4. Verify backend logs

### Webhook not receiving events?
1. Use ngrok for local testing
2. Verify webhook secret
3. Check webhook signature validation
4. Test webhook in Razorpay dashboard

### Order not updating?
1. Check webhook delivery in Razorpay dashboard
2. Verify Payment model exists
3. Check backend logs for errors

---

## 🚀 Production Deployment

### Before Going Live:
1. ✅ Switch to live Razorpay keys (`rzp_live_xxx`)
2. ✅ Update webhook URL to production domain
3. ✅ Enable HTTPS
4. ✅ Test all payment scenarios
5. ✅ Set up monitoring and alerts
6. ✅ Configure email notifications
7. ✅ Train support team
8. ✅ Document refund process

---

## 📞 Support

- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- Test Dashboard: https://dashboard.razorpay.com/test/dashboard

---

## ✅ Checklist

**Backend:**
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Order model updated
- [ ] Routes registered in server.js
- [ ] Server running without errors

**Frontend:**
- [ ] Animations CSS imported
- [ ] Routes added to router
- [ ] useRazorpay hook updated
- [ ] Post-payment pages accessible

**Razorpay:**
- [ ] Account created
- [ ] API keys obtained
- [ ] Webhook configured
- [ ] Test mode enabled

**Testing:**
- [ ] Success flow tested
- [ ] Failed flow tested
- [ ] Pending flow tested
- [ ] Webhook tested

---

**Your Razorpay payment integration is complete!** 🎉
