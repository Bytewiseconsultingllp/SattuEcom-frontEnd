import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { getCartItems, addToCart as apiAddToCart, removeItemFromCart, updateCartItemQuantity, } from '@/lib/api/cart';
import { toast } from 'sonner';
import { CartItem, ApiResponse } from '@/types/cart';
import { getUserCookie } from '@/utils/cookie';

// Local storage key to avoid empty-cart flash and provide instant UX
const CART_STORAGE_KEY = 'sattu-cart-items_v1';

function getStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read cart from storage', e);
    return [];
  }
}

function storeCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to write cart to storage', e);
  }
}

interface LoadingState {
  type: 'add' | 'remove' | 'update' | 'refresh' | 'clear';
  itemId?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  loadingState: LoadingState | null;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  isItemLoading: (itemId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage to avoid empty-cart flash
  const [cartItems, setCartItems] = useState<CartItem[]>(getStoredCart);
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const isLoading = loadingState?.type === 'refresh';

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    storeCart(cartItems);
  }, [cartItems]);

  // Calculate cart total using useMemo to avoid unnecessary recalculations
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }, [cartItems]);

  const isItemLoading = (itemId: string) => {
    return loadingState?.itemId === itemId;
  };

  const refreshCart = async () => {
    // Prevent concurrent refreshes
    if (loadingState?.type === 'refresh') return;
    // Only show the global/initial loading state when the local cart is empty
    const showLoading = cartItems.length === 0;
    try {
      if (showLoading) setLoadingState({ type: 'refresh' });
      const response = await getCartItems() as ApiResponse<CartItem[]>;
      if (response.success) {
        setCartItems(response.data);
        setLastRefreshTime(Date.now());
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to fetch cart items');
    } finally {
      if (showLoading) setLoadingState(null);
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    // Optimistic update: update local cart immediately
  const previous = [...cartItems];
  const existing = previous.find(i => i.product_id === productId);
    let optimistic: CartItem[];
    if (existing) {
      optimistic = previous.map(i => i.product_id === productId ? { ...i, quantity: i.quantity + quantity } : i);
    } else {
      // Create a minimal optimistic item; backend will supply full fields on next refresh
      optimistic = [...previous, { id: `temp-${productId}`, product_id: productId, quantity, product: { id: productId, name: '', price: 0, category: '' } } as CartItem];
    }
    setCartItems(optimistic);
    // Indicate add-in-progress for UI components
    setLoadingState({ type: 'add', itemId: productId });
    try {
      const response = await apiAddToCart(productId, quantity) as ApiResponse<CartItem>;
      if (response.success) {
        toast.success('Item added to cart');
        // Refresh in background to reconcile with server state
        getCartItems().then((res) => {
          if ((res as ApiResponse<CartItem[]>).success) setCartItems((res as ApiResponse<CartItem[]>).data);
        }).catch(() => {});
      } else {
        // revert if API responded with failure
        setCartItems(previous);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
      setCartItems(previous);
    } finally {
      setLoadingState(null);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    // Optimistic update
    const previous = [...cartItems];
  setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));

    try {
      setLoadingState({ type: 'update', itemId });
      const response = await updateCartItemQuantity(itemId, quantity) as ApiResponse<CartItem>;
      if (response.success) {
        toast.success('Quantity updated');
        // Background reconcile
        getCartItems().then((res) => {
          if ((res as ApiResponse<CartItem[]>).success) setCartItems((res as ApiResponse<CartItem[]>).data);
        }).catch(() => {});
      } else {
        setCartItems(previous);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      setCartItems(previous);
    } finally {
      setLoadingState(null);
    }
  };

  const removeFromCart = async (itemId: string) => {
    // Optimistic removal
    const previous = [...cartItems];
  setCartItems(prev => prev.filter(i => i.id !== itemId));

    try {
      setLoadingState({ type: 'remove', itemId });
      const response = await removeItemFromCart(itemId) as ApiResponse<void>;
      if (response.success) {
        toast.success('Item removed from cart');
        // Background reconcile
        getCartItems().then((res) => {
          if ((res as ApiResponse<CartItem[]>).success) setCartItems((res as ApiResponse<CartItem[]>).data);
        }).catch(() => {});
      } else {
        setCartItems(previous);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
      setCartItems(previous);
    } finally {
      setLoadingState(null);
    }
  };
  
  // Initial cart load
  useEffect(() => {
    refreshCart();
  }, []);

  // Track last refresh time to prevent rapid refreshes
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  
  // Refresh cart when window regains focus (with debounce)
  useEffect(() => {
    let timeoutId: number | undefined;
    const minimumRefreshInterval = 3000; // 3 seconds

    const handleRefresh = () => {
      const now = Date.now();
      if (now - lastRefreshTime >= minimumRefreshInterval) {
        refreshCart();
        setLastRefreshTime(now);
      }
    };

    const debouncedRefresh = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(handleRefresh, 300);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        debouncedRefresh();
      }
    };

    window.addEventListener('focus', debouncedRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener('focus', debouncedRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lastRefreshTime]);

  const value = {
    cartItems,
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    cartTotal,
    isLoading,
    loadingState,
    addToCart,
    removeFromCart,
    updateQuantity,
    refreshCart,
    isItemLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}