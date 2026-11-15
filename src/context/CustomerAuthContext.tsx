"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import { toast } from "sonner";

export interface CustomerUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  provider: "google" | "email" | "demo";
  points?: number;
}

interface CustomerAuthContextType {
  user: CustomerUser | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isFirebaseConfigured: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (name: string, email: string) => void;
  dismissModal: () => void;
  logout: () => Promise<void>;
}

const CUSTOMER_STORAGE_KEY = "superbarrio_customer_user";
const MODAL_DISMISSED_KEY = "superbarrio_auth_modal_dismissed";

// Sync customer login session to Admin Panel database in background
const syncCustomerToAdmin = (customer: CustomerUser) => {
  if (!customer?.email) return;
  try {
    fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: customer.uid,
        name: customer.displayName,
        email: customer.email,
        photoURL: customer.photoURL,
        provider: customer.provider,
      }),
    }).catch((err) => {
      console.warn("Notice: background admin sync delayed:", err);
    });
  } catch (err) {
    console.warn("syncCustomerToAdmin exception:", err);
  }
};

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Initialize auth state
  useEffect(() => {
    // 1. Clean out any previous demo/mock users from localStorage
    try {
      const stored = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email && !parsed.uid?.includes("demo")) {
          setUser(parsed);
          syncCustomerToAdmin(parsed);
        } else {
          // Clear old demo user
          localStorage.removeItem(CUSTOMER_STORAGE_KEY);
          setUser(null);
        }
      }
    } catch (e) {
      console.warn("Could not parse saved customer user:", e);
    } finally {
      setIsLoading(false);
    }

    // 2. Listen to real Firebase auth state
    let unsubscribe = () => {};
    if (auth) {
      try {
        unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
          if (fbUser) {
            const photo =
              fbUser.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                fbUser.displayName || fbUser.email?.split("@")[0] || "User"
              )}&background=10b981&color=fff&bold=true&size=128`;

            const customer: CustomerUser = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Customer",
              email: fbUser.email || "",
              photoURL: photo,
              provider: "google",
              points: 250,
            };
            setUser(customer);
            localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
            syncCustomerToAdmin(customer);
          }
        });
      } catch (e) {
        console.warn("Firebase onAuthStateChanged error:", e);
      }
    }

    // 3. Auto-open modal on first arrival if user is not logged in
    const checkFirstVisit = setTimeout(() => {
      try {
        const storedUser = localStorage.getItem(CUSTOMER_STORAGE_KEY);
        const dismissed = sessionStorage.getItem(MODAL_DISMISSED_KEY);
        if (!storedUser && !dismissed) {
          setIsAuthModalOpen(true);
        }
      } catch (e) {
        console.warn("Check first visit error:", e);
      }
    }, 700);

    return () => {
      clearTimeout(checkFirstVisit);
      unsubscribe();
    };
  }, []);

  // Google Login (Real Firebase Google OAuth Popup)
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);

      const realName = result.user.displayName || result.user.email?.split("@")[0] || "Google User";
      const photo =
        result.user.photoURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(realName)}&background=10b981&color=fff&bold=true&size=128`;

      const customer: CustomerUser = {
        uid: result.user.uid,
        displayName: realName,
        email: result.user.email || "",
        photoURL: photo,
        provider: "google",
        points: 250,
      };

      setUser(customer);
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
      syncCustomerToAdmin(customer);
      setIsAuthModalOpen(false);
      toast.success(`Welcome, ${customer.displayName}! Logged in with Google.`);
    } catch (error: any) {
      console.warn("Firebase Google login error:", error);
      const rawErr = String(error?.message || error?.code || "").toLowerCase();

      // Popup closed by user
      if (rawErr.includes("popup-closed-by-user") || rawErr.includes("cancelled-popup-request")) {
        setIsLoading(false);
        return;
      }

      if (rawErr.includes("operation-not-allowed")) {
        toast.error("Firebase Console mein Google provider ko Enable karein!");
        return;
      }

      toast.error(error?.message || "Google sign-in could not be completed.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Custom email or manual login
  const loginWithEmail = useCallback((name: string, email: string) => {
    const photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || email
    )}&background=10b981&color=fff&bold=true&size=128`;

    const customer: CustomerUser = {
      uid: `customer-${Date.now()}`,
      displayName: name.trim() || email.split("@")[0] || "Customer",
      email: email.trim(),
      photoURL: photo,
      provider: "email",
      points: 100,
    };

    setUser(customer);
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
    syncCustomerToAdmin(customer);
    setIsAuthModalOpen(false);
    toast.success(`Welcome, ${customer.displayName}!`);
  }, []);

  // Dismiss modal for session
  const dismissModal = useCallback(() => {
    setIsAuthModalOpen(false);
    try {
      sessionStorage.setItem(MODAL_DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
  }, []);

  // Sign out
  const logout = useCallback(async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (e) {
      console.warn("SignOut error:", e);
    }
    setUser(null);
    try {
      localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      sessionStorage.removeItem(MODAL_DISMISSED_KEY);
    } catch {
      // ignore
    }
    toast.info("Signed out successfully.");
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        isFirebaseConfigured,
        setIsAuthModalOpen,
        loginWithGoogle,
        loginWithEmail,
        dismissModal,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
};
