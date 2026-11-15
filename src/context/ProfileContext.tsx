"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AdminProfileData, DEFAULT_ADMIN_PROFILE } from "@/lib/validations/profile";

interface ProfileContextType {
  profile: AdminProfileData;
  isMounted: boolean;
  isLoading: boolean;
  isSaving: boolean;
  updateProfile: (data: Partial<AdminProfileData>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const STORAGE_KEY = "superbarrio_admin_profile";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AdminProfileData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return { ...DEFAULT_ADMIN_PROFILE, ...JSON.parse(saved) };
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_ADMIN_PROFILE;
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile");
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch profile from API, using cached state:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Post-hydration client synchronization
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProfile({ ...DEFAULT_ADMIN_PROFILE, ...JSON.parse(saved) });
      }
    } catch {
      // ignore
    }
    refreshProfile();
  }, [refreshProfile]);

  const updateProfile = async (partial: Partial<AdminProfileData>): Promise<boolean> => {
    setIsSaving(true);
    const updated = { ...profile, ...partial };
    setProfile(updated);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          } catch {
            // ignore
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn("API profile update fallback:", err);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isMounted,
        isLoading,
        isSaving,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useAdminProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    // Return default fallback if called outside provider to prevent crashing
    return {
      profile: DEFAULT_ADMIN_PROFILE,
      isMounted: true,
      isLoading: false,
      isSaving: false,
      updateProfile: async () => false,
      refreshProfile: async () => {},
    };
  }
  return context;
}
