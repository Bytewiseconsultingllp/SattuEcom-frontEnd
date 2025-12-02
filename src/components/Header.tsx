import { Link } from "react-router-dom";
import { ShoppingCart, Heart, User, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CompanyLogo from "@/assets/companyLogo.jpeg";
import { useCart } from "@/contexts/CartContext";
import { getUserCookie, removeUserCookie } from "@/utils/cookie";
import { getWishlistItems } from "@/lib/api/wishlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { cartCount } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    setUserData(getUserCookie());
  }, []);

  const isLoggedIn = useMemo(() => {
    const uc = userData;
    return Boolean(uc && (uc.token || uc?.data?.token));
  }, [userData]);

  const userRole = useMemo(() => {
    const rawRole = userData?.role || userData?.data?.role || userData?.user?.role;
    return rawRole ? String(rawRole).toLowerCase() : undefined;
  }, [userData]);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      try {
        if (!isLoggedIn) { setWishlistCount(0); return; }
        const res = await getWishlistItems();
        setWishlistCount(res?.data?.length || res?.count || 0);
      } catch {
        setWishlistCount(0);
      }
    };
    fetchWishlistCount();
    const handler = () => { fetchWishlistCount(); };
    window.addEventListener('wishlist:changed', handler);
    return () => window.removeEventListener('wishlist:changed', handler);
  }, [isLoggedIn]);

  const handleWishlistClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate("/wishlist");
  };

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
  };

  const handleDashboardNavigate = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (userRole === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    navigate("/user/dashboard");
  };

  const handleLogout = () => {
    removeUserCookie();
    navigate("/");
    // force header to re-evaluate
    setUserData(null);
    setWishlistCount(0);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-hero">
              <span className="text-lg font-bold text-primary-foreground">S</span>
            </div> */}
            <img src={CompanyLogo} className="flex h-16 w-16 items-center justify-center rounded-lg"/>
            <span className="text-xl font-bold text-foreground">Grain Fusion</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden flex-1 max-w-xl mx-8 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search for sattu products..." 
                className="pl-10 bg-background"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop User Icon */}
            <div className="hidden md:block">
              {!isLoggedIn ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleProfileClick}
                >
                  <User className="h-5 w-5" />
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDashboardNavigate}>My Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {/* Wishlist Button - Visible on all screens */}
            <Button variant="ghost" size="icon" className="relative" onClick={handleWishlistClick}>
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            {/* Cart Button - Visible on all screens */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Hamburger Button - Mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex h-12 items-center space-x-6 text-sm">
          <Link to="/" className="font-medium text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/products" className="font-medium text-muted-foreground hover:text-primary transition-colors">
            All Products
          </Link>
          <Link to="/sattu-powder" className="text-muted-foreground hover:text-primary transition-colors">
            Sattu Powder
          </Link>
          <Link to="/ready-to-drink" className="text-muted-foreground hover:text-primary transition-colors">
            Ready to Drink
          </Link>
          <Link to="/snacks-ladoo" className="text-muted-foreground hover:text-primary transition-colors">
            Snacks & Ladoo
          </Link>
          <Link to="/custom-sattu" className="text-muted-foreground hover:text-primary transition-colors">
            Custom Sattu
          </Link>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden flex flex-col space-y-2 pb-3 border-t pt-3">
            <Link to="/" className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/products" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              All Products
            </Link>
            <Link to="/sattu-powder" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              Sattu Powder
            </Link>
            <Link to="/ready-to-drink" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              Ready to Drink
            </Link>
            <Link to="/snacks-ladoo" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              Snacks & Ladoo
            </Link>
            <Link to="/custom-sattu" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              Custom Sattu
            </Link>
            
            {/* Mobile User Actions */}
            <div className="border-t pt-2 mt-2">
              {!isLoggedIn ? (
                <Link to="/login" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Login / Sign Up</span>
                  </div>
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleDashboardNavigate}
                    className="w-full text-left block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>My Dashboard</span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Search Bar - Mobile */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-10 bg-background"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
