"use client";

import React, { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { useAdminProfile } from "@/context/ProfileContext";
import { toast } from "sonner";

export default function Security() {
  const { profile, updateProfile } = useAdminProfile();
  const { isOpen, openModal, closeModal } = useModal();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const handle2FAToggle = async () => {
    const nextState = !profile.twoFactorEnabled;
    const success = await updateProfile({ twoFactorEnabled: nextState });
    if (success) {
      if (nextState) {
        toast.success("Two-factor authentication (2FA) enabled!");
      } else {
        toast.info("Two-factor authentication disabled.");
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsChanging(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        closeModal();
      } else {
        toast.error(data.error || "Failed to change password.");
      }
    } catch {
      toast.error("Network error. Could not change password.");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
          Security & Access Credentials
        </h4>
        <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
          {/* Change Password row */}
          <div className="flex flex-col justify-between gap-4 pt-4 first:pt-0 sm:flex-row sm:items-center">
            <div>
              <span className="block text-base font-semibold text-gray-800 dark:text-white/90">
                Change Password
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update master administrative credentials and passkeys.
              </p>
            </div>
            <div>
              <button
                onClick={openModal}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="size-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12.3861 5.08087L14.9182 7.61296M15.6437 3.5917L16.408 4.35603C16.8962 4.84419 16.8962 5.63564 16.408 6.1238L7.83547 14.6963C7.69039 14.8414 7.51182 14.9486 7.31554 15.0083L3.97461 16.0251L4.99141 12.6842C5.05115 12.4879 5.15829 12.3093 5.30337 12.1642L13.8759 3.5917C14.3641 3.10355 15.1555 3.10355 15.6437 3.5917Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Change Password
              </button>
            </div>
          </div>

          {/* 2FA Toggle Row */}
          <div className="flex flex-col justify-between gap-4 pt-4 sm:flex-row sm:items-center">
            <div>
              <span className="block text-base font-semibold text-gray-800 dark:text-white/90">
                Two-Factor Authentication (2FA)
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enforce OTP or authenticator security for high-value operations.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handle2FAToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  profile.twoFactorEnabled ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    profile.twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[500px]">
        <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
          <div className="mb-6">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              Change Master Password
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your current administrative password to set a new key.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label>Current Password *</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <Label>New Password *</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <Label>Confirm New Password *</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isChanging}>
                {isChanging ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
