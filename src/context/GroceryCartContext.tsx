"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, GroceryProduct } from "@/types/grocery";

export interface FlyingCartItem {
  id: string;
  imageUrl: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "discount";

interface GroceryCartContextType {
  cart: CartItem[];
  isLoaded: boolean;
  addToCart: (
    product: GroceryProduct,
    quantity?: number,
    startElement?: HTMLElement | null,
  ) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  discountRate: number;
  discountAmount: number;
  promoCode: string;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  total: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Flying cart & bounce animation
  flyingItems: FlyingCartItem[];
  isBasketBouncing: boolean;
  triggerFlyToCart: (
    imageUrl: string | undefined,
    startElement: HTMLElement | null,
  ) => void;
  onFlyingItemComplete: (id: string) => void;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  isWishlisted: (productId: string) => boolean;
  // Quick View
  quickViewProduct: GroceryProduct | null;
  setQuickViewProduct: (product: GroceryProduct | null) => void;
  // Recently viewed
  recentlyViewed: GroceryProduct[];
  addToRecentlyViewed: (product: GroceryProduct) => void;
  // Sort and Filters
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  filterInStockOnly: boolean;
  setFilterInStockOnly: (val: boolean) => void;
  filterOnSaleOnly: boolean;
  setFilterOnSaleOnly: (val: boolean) => void;
}

const GroceryCartContext = createContext<GroceryCartContextType | undefined>(
  undefined,
);

const CART_STORAGE_KEY = "tailgrocery_cart_items";
const WISHLIST_STORAGE_KEY = "tailgrocery_wishlist";
const RECENTLY_VIEWED_KEY = "tailgrocery_recently_viewed";

export const GroceryCartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Promo Code State
  const [promoCode, setPromoCode] = useState("");
  const [discountRate, setDiscountRate] = useState(0);

  // Flying cart & Basket animation
  const [flyingItems, setFlyingItems] = useState<FlyingCartItem[]>([]);
  const [isBasketBouncing, setIsBasketBouncing] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Quick View modal state
  const [quickViewProduct, setQuickViewProduct] =
    useState<GroceryProduct | null>(null);

  // Recently viewed products
  const [recentlyViewed, setRecentlyViewed] = useState<GroceryProduct[]>([]);

  // Sort and filters
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);
  const [filterOnSaleOnly, setFilterOnSaleOnly] = useState(false);

  const freeDeliveryThreshold = 25.0;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
      const storedRecent = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (storedRecent) {
        setRecentlyViewed(JSON.parse(storedRecent));
      }
    } catch {
      // Ignore storage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart, isLoaded]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Ignore
    }
  }, [wishlist, isLoaded]);

  // Save recently viewed to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
    } catch {
      // Ignore
    }
  }, [recentlyViewed, isLoaded]);

  const addToRecentlyViewed = (product: GroceryProduct) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 8);
    });
  };

  const toggleWishlist = (productId: string) => {
    const isPresent = wishlist.includes(productId);
    if (isPresent) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      return false; // Removed
    } else {
      setWishlist((prev) => [...prev, productId]);
      return true; // Added
    }
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const applyPromoCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === "FRESH20") {
      setPromoCode("FRESH20");
      setDiscountRate(0.2); // 20% discount
      return { success: true, message: "Promo code FRESH20 applied! 20% discount added." };
    }
    return { success: false, message: "Invalid promo code. Try 'FRESH20' for 20% off." };
  };

  const removePromoCode = () => {
    setPromoCode("");
    setDiscountRate(0);
  };

  const triggerFlyToCart = (
    imageUrl: string | undefined,
    startElement: HTMLElement | null,
  ) => {
    if (!startElement) return;

    const basketBtn = document.getElementById("header-basket-btn");
    const startRect = startElement.getBoundingClientRect();

    let targetX = window.innerWidth - 60;
    let targetY = 24;

    if (basketBtn) {
      const targetRect = basketBtn.getBoundingClientRect();
      targetX = targetRect.left + targetRect.width / 2 - 28;
      targetY = targetRect.top + targetRect.height / 2 - 28;
    }

    const newItem: FlyingCartItem = {
      id: `${Date.now()}-${Math.random()}`,
      imageUrl: imageUrl || "",
      startX: startRect.left + startRect.width / 2 - 28,
      startY: startRect.top + startRect.height / 2 - 28,
      endX: targetX,
      endY: targetY,
    };

    setFlyingItems((prev) => [...prev, newItem]);
  };

  const onFlyingItemComplete = (id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    setIsBasketBouncing(true);
    setTimeout(() => {
      setIsBasketBouncing(false);
    }, 600);
  };

  const addToCart = (
    product: GroceryProduct,
    quantity: number = 1,
    startElement?: HTMLElement | null,
  ) => {
    if (startElement) {
      triggerFlyToCart(product.imageUrl, startElement);
    }
    addToRecentlyViewed(product);

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );
  const discountAmount = Number((subtotal * discountRate).toFixed(2));
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);

  const deliveryFee =
    subtotal === 0 || subtotal >= freeDeliveryThreshold ? 0 : 2.5;
  const total = Number((subtotalAfterDiscount + deliveryFee).toFixed(2));
  const amountNeededForFreeDelivery = Math.max(
    0,
    Number((freeDeliveryThreshold - subtotal).toFixed(2)),
  );

  return (
    <GroceryCartContext.Provider
      value={{
        cart,
        isLoaded,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        discountRate,
        discountAmount,
        promoCode,
        applyPromoCode,
        removePromoCode,
        total,
        freeDeliveryThreshold,
        amountNeededForFreeDelivery,
        isCartOpen,
        setIsCartOpen,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        flyingItems,
        isBasketBouncing,
        triggerFlyToCart,
        onFlyingItemComplete,
        wishlist,
        toggleWishlist,
        isWishlisted,
        quickViewProduct,
        setQuickViewProduct,
        recentlyViewed,
        addToRecentlyViewed,
        sortBy,
        setSortBy,
        filterInStockOnly,
        setFilterInStockOnly,
        filterOnSaleOnly,
        setFilterOnSaleOnly,
      }}
    >
      {children}
    </GroceryCartContext.Provider>
  );
};

const fallbackContext: GroceryCartContextType = {
  cart: [],
  isLoaded: false,
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  deliveryFee: 0,
  discountRate: 0,
  discountAmount: 0,
  promoCode: "",
  applyPromoCode: () => ({ success: false, message: "" }),
  removePromoCode: () => {},
  total: 0,
  freeDeliveryThreshold: 25,
  amountNeededForFreeDelivery: 25,
  isCartOpen: false,
  setIsCartOpen: () => {},
  activeCategory: "all",
  setActiveCategory: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  flyingItems: [],
  isBasketBouncing: false,
  triggerFlyToCart: () => {},
  onFlyingItemComplete: () => {},
  wishlist: [],
  toggleWishlist: () => false,
  isWishlisted: () => false,
  quickViewProduct: null,
  setQuickViewProduct: () => {},
  recentlyViewed: [],
  addToRecentlyViewed: () => {},
  sortBy: "featured",
  setSortBy: () => {},
  filterInStockOnly: false,
  setFilterInStockOnly: () => {},
  filterOnSaleOnly: false,
  setFilterOnSaleOnly: () => {},
};

export const useGroceryCart = () => {
  const context = useContext(GroceryCartContext);
  return context || fallbackContext;
};
