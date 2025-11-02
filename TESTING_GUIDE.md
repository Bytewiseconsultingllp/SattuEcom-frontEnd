# Razorpay Payment Testing Guide 🧪

## ✅ Setup Complete!

All integration steps have been completed:
- ✅ Routes added to App.tsx
- ✅ Animations CSS imported in main.tsx
- ✅ useRazorpay hook updated with redirects
- ✅ Post-payment pages created

---

## 🧪 Testing Payment Flows

### Prerequisites
1. Backend server running with Razorpay keys configured
2. Frontend development server running
3. User logged in
4. Items in cart

---

## Test Flow 1: Successful Payment ✅

### Test Card Details
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits (e.g., 123)
Expiry: Any future date (e.g., 12/25)
Name: Any name
```

### Steps:
1. **Add items to cart**
   - Go to `/products`
   - Add 1-2 products to cart

2. **Proceed to checkout**
   - Click cart icon
   - Click "Proceed to Checkout"

3. **Select/Add delivery address**
   - Select existing address or add new one
   - Click "Continue to Delivery Options"

4. **Choose delivery options**
   - Select delivery speed
   - Add gift options if desired
   - Click "Continue to Review Order"

5. **Review and place order**
   - Verify order details
   - Click "Place Order & Pay ₹XXX"

6. **Complete Razorpay payment**
   - Razorpay modal opens
   - Enter test card: `4111 1111 1111 1111`
   - Enter CVV: `123`
   - Enter Expiry: `12/25`
   - Click "Pay"

7. **Verify success page**
   - Should redirect to `/payment-success`
   - ✅ Green checkmark animation
   - ✅ Order ID displayed
   - ✅ Payment ID displayed
   - ✅ "What's Next?" section visible
   - ✅ "View Order Details" button works
   - ✅ "Continue Shopping" button works

8. **Check backend**
   - Order status should be "paid"
   - Payment record created
   - Cart should be empty

### Expected Result:
✅ Payment successful
✅ Redirected to success page
✅ Order created and paid
✅ Cart cleared
✅ Email sent (if configured)

---

## Test Flow 2: Failed Payment ❌

### Test Card Details (Declined)
```
Card Number: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date
```

### Steps:
1. Follow steps 1-5 from Test Flow 1
2. **Enter failing card**
   - Card: `4000 0000 0000 0002`
   - CVV: `123`
   - Expiry: `12/25`
   - Click "Pay"

3. **Verify failed page**
   - Should redirect to `/payment-failed`
   - ❌ Red X icon
   - ❌ Error code displayed
   - ❌ Error description shown
   - ❌ Troubleshooting tips visible
   - ❌ "Retry Payment" button works
   - ❌ "Contact Support" button works
   - ❌ "Go to Home" button works

4. **Check backend**
   - Order status should be "pending"
   - Payment status should be "failed"
   - Error details recorded

### Expected Result:
❌ Payment failed
❌ Redirected to failed page
❌ Order created but not paid
❌ Cart still has items
❌ User can retry payment

---

## Test Flow 3: Payment Cancelled/Pending ⏳

### Steps:
1. Follow steps 1-5 from Test Flow 1
2. **Close Razorpay modal**
   - When Razorpay modal opens
   - Click "X" or press ESC
   - Or click outside modal

3. **Verify pending page**
   - Should redirect to `/payment-pending`
   - ⏳ Yellow clock icon with pulse animation
   - ⏳ Timer showing elapsed time
   - ⏳ Processing steps visualization
   - ⏳ "What's Happening?" section
   - ⏳ "What Should You Do?" guidance
   - ⏳ "Check Order Status" button works
   - ⏳ "Go to Home" button works

4. **Check backend**
   - Order status should be "pending"
   - Payment status should be "failed" or "created"

### Expected Result:
⏳ Payment pending
⏳ Redirected to pending page
⏳ Order created but not paid
⏳ User can check status or retry

---

## Additional Test Scenarios

### Test 4: Network Error During Payment
**Simulate:** Disconnect internet after clicking "Pay"
**Expected:** Redirect to failed page with network error message

### Test 5: Invalid Card Details
**Card:** `4242 4242 4242 4242` (Invalid)
**Expected:** Razorpay shows validation error inline

### Test 6: Insufficient Funds
**Card:** `4000 0000 0000 9995`
**Expected:** Redirect to failed page with "Insufficient funds" error

### Test 7: Payment Timeout
**Action:** Leave Razorpay modal open for 15+ minutes
**Expected:** Session timeout, redirect to pending page

---

## Testing Checklist

### Pre-Payment
- [ ] User is logged in
- [ ] Cart has items
- [ ] Address is selected
- [ ] Delivery options chosen
- [ ] Order summary is correct

### During Payment
- [ ] Razorpay modal opens
- [ ] User details pre-filled
- [ ] Amount is correct
- [ ] Currency is INR
- [ ] Loading states work

### Post-Payment Success
- [ ] Redirects to `/payment-success`
- [ ] Order ID shown
- [ ] Payment ID shown
- [ ] Success animation plays
- [ ] Buttons work correctly
- [ ] Cart is cleared
- [ ] Order status is "paid"

### Post-Payment Failed
- [ ] Redirects to `/payment-failed`
- [ ] Error details shown
- [ ] Troubleshooting tips visible
- [ ] Retry button works
- [ ] Order status is "pending"
- [ ] Cart still has items

### Post-Payment Pending
- [ ] Redirects to `/payment-pending`
- [ ] Timer is running
- [ ] Processing steps shown
- [ ] Guidance is clear
- [ ] Check status works

---

## Backend Verification

### Check Order Status
```bash
# In MongoDB or your database
db.orders.findOne({ _id: "order_id" })

# Should have:
# - payment_status: "paid" | "pending" | "failed"
# - razorpay_order_id: "order_xxx"
# - paid_at: Date (if paid)
```

### Check Payment Record
```bash
db.payments.findOne({ order_id: "order_id" })

# Should have:
# - razorpay_order_id
# - razorpay_payment_id (if completed)
# - status: "created" | "captured" | "failed"
# - amount
```

---

## Webhook Testing

### Using ngrok (for local testing)
```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 5000

# Copy the HTTPS URL
# Update Razorpay webhook URL to:
# https://your-ngrok-url.ngrok.io/api/webhooks/razorpay
```

### Test Webhook Events
1. Complete a test payment
2. Check Razorpay dashboard → Webhooks → Logs
3. Verify events are delivered
4. Check backend logs for webhook processing

---

## Mobile Testing

### Test on Mobile Devices
1. Use ngrok to expose local server
2. Access frontend on mobile browser
3. Complete payment flow
4. Verify responsive design
5. Test all three payment outcomes

---

## Browser Testing

Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## Common Issues & Solutions

### Issue: Razorpay modal doesn't open
**Solution:** 
- Check if Razorpay script is loaded
- Open browser console for errors
- Verify API keys are correct

### Issue: Payment verification fails
**Solution:**
- Check backend logs
- Verify signature validation
- Ensure webhook secret is correct

### Issue: Redirect doesn't work
**Solution:**
- Check browser console
- Verify routes are registered
- Check for JavaScript errors

### Issue: Animations don't work
**Solution:**
- Verify animations.css is imported
- Check browser DevTools for CSS errors
- Clear browser cache

---

## Performance Testing

### Test Payment Speed
1. Measure time from "Place Order" to success page
2. Should be < 5 seconds for successful payment
3. Check network tab for slow API calls

### Test Concurrent Payments
1. Open multiple tabs
2. Initiate payments simultaneously
3. Verify all complete successfully

---

## Security Testing

### Verify Security Measures
- [ ] Payment signature verified on backend
- [ ] Webhook signature verified
- [ ] API keys not exposed in frontend
- [ ] User authentication required
- [ ] Order ownership validated
- [ ] HTTPS used in production

---

## Test Data

### Valid Test Cards
```
Success: 4111 1111 1111 1111
Declined: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
Lost Card: 4000 0000 0000 9987
```

### Test Amounts
- Small: ₹100
- Medium: ₹1000
- Large: ₹10000

---

## Reporting Issues

When reporting issues, include:
1. Test card used
2. Browser and version
3. Console errors
4. Network tab screenshot
5. Backend logs
6. Steps to reproduce

---

## Success Criteria

✅ All three payment flows work correctly
✅ Redirects happen automatically
✅ User experience is smooth
✅ Error messages are clear
✅ Backend updates correctly
✅ Webhooks are received
✅ Mobile experience is good
✅ All browsers work

---

**Happy Testing!** 🎉

For issues or questions, refer to:
- `IMPLEMENTATION_GUIDE.md`
- `POST_PAYMENT_PAGES.md`
- `RAZORPAY_SETUP.md`
