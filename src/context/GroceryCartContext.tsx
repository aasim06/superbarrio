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

interface GroceryCartContextType {
  cart: CartItem[];
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
  total: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Flying cart & bounce animation state
  flyingItems: FlyingCartItem[];
  isBasketBouncing: boolean;
  triggerFlyToCart: (
    imageUrl: string | undefined,
    startElement: HTMLElement | null,
  ) => void;
  onFlyingItemComplete: (id: string) => void;
}

const GroceryCartContext = createContext<GroceryCartContextType | undefined>(
  undefined,
);

const CART_STORAGE_KEY = "tailgrocery_cart_items";

export const GroceryCartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Animation states
  const [flyingItems, setFlyingItems] = useState<FlyingCartItem[]>([]);
  const [isBasketBouncing, setIsBasketBouncing] = useState(false);

  const freeDeliveryThreshold = 25.0;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart, isLoaded]);

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
    // Trigger bounce on basket
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
  const deliveryFee =
    subtotal === 0 || subtotal >= freeDeliveryThreshold ? 0 : 2.5;
  const total = Number((subtotal + deliveryFee).toFixed(2));
  const amountNeededForFreeDelivery = Math.max(
    0,
    Number((freeDeliveryThreshold - subtotal).toFixed(2)),
  );

  return (
    <GroceryCartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
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
      }}
    >
      {children}
    </GroceryCartContext.Provider>
  );
};

const fallbackContext: GroceryCartContextType = {
  cart: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  deliveryFee: 0,
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
};

export const useGroceryCart = () => {
  const context = useContext(GroceryCartContext);
  return context || fallbackContext;
};
