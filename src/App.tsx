import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/index";
import Products from "./pages/Products";
import SattuPowder from "./pages/SattuPowder";
import ReadyToDrink from "./pages/ReadyToDrink";
import SnacksLadoo from "./pages/SnacksLadoo";
import CustomSattu from "./pages/CustomSattu";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import DeliveryOptions from "./pages/DeliveryOptions";
import OrderReview from "./pages/OrderReview";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OrderDetails from "./pages/OrderDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import VerifyRegistration from "./pages/verifyRegistration";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyLogin from "./pages/VerifyLogin";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentPending from "./pages/PaymentPending";
import OrderConfirmation from "./pages/OrderConfirmation";
import ContactUs from "./pages/ContactUs";
import CustomGiftRequest from "./pages/CustomGiftRequest";
import { InvoicesPage } from "./pages/InvoicesPage";
import { AdminInvoicesPage } from "./components/admin/AdminInvoicesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sattu-powder" element={<SattuPowder />} />
            <Route path="/ready-to-drink" element={<ReadyToDrink />} />
            <Route path="/snacks-ladoo" element={<SnacksLadoo />} />
            <Route path="/custom-sattu" element={<CustomSattu />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/delivery-options" element={<DeliveryOptions />} />
            <Route path="/order-review" element={<OrderReview />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/invoices" element={<AdminInvoicesPage />} />
            <Route path="/order/:id" element={<OrderDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/verify-login" element={<VerifyLogin />} />
            <Route path="/verify-registration" element={<VerifyRegistration />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/custom-gift-request" element={<CustomGiftRequest />} />
            
            {/* Payment Routes */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/payment-pending" element={<PaymentPending />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
