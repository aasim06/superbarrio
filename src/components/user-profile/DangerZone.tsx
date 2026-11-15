"use client";

import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

export default function DangerZone() {
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");

  const handleLogoutAll = () => {
    toast.success("Successfully logged out from all active sessions.");
    setIsLogoutModalOpen(false);
    setTimeout(() => {
      router.push("/signin");
    }, 600);
  };

  const handleDeleteAccount = () => {
    if (confirmDeleteText !== "DELETE") {
      toast.error("Please type DELETE to confirm account termination.");
      return;
    }
    toast.error("Store administrative account scheduled for decommission.");
    setIsDeleteModalOpen(false);
    setTimeout(() => {
      router.push("/signin");
    }, 800);
  };

  return (
    <>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
          Danger Zone
        </h4>
        <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
          {/* Logout all devices */}
          <div className="flex flex-col justify-between gap-4 pt-4 first:pt-0 sm:flex-row sm:items-center">
            <div>
              <span className="block text-base font-semibold text-gray-800 dark:text-white/90">
                Logout All Devices
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Invalidate all active sessions across browsers and mobile terminals.
              </p>
            </div>
            <div>
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Logout All
              </button>
            </div>
          </div>

          {/* Delete account */}
          <div className="flex flex-col justify-between gap-4 pt-4 sm:flex-row sm:items-center">
            <div>
              <span className="block text-base font-semibold text-error-600 dark:text-error-400">
                Decommission Administrator Account
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Permanently revoke master administrative privileges. This action cannot be undone.
              </p>
            </div>
            <div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-error-500 bg-white px-4 py-2.5 text-sm font-semibold text-error-600 shadow-sm hover:bg-error-50 dark:border-error-500/30 dark:bg-gray-800 dark:hover:bg-error-950/20"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} className="m-4 max-w-[450px]">
        <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Confirm Global Logout
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to sign out from all active sessions? You will need to sign in again.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button size="sm" variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleLogoutAll}>
              Logout From All
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="m-4 max-w-[450px]">
        <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="text-xl font-bold text-error-600 mb-2">
            Delete Administrator Account
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Type <strong className="text-gray-900 dark:text-white font-mono">DELETE</strong> below to confirm.
          </p>
          <div className="mb-6">
            <Label>Confirmation</Label>
            <Input
              type="text"
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
              placeholder="Type DELETE"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button size="sm" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <button
              onClick={handleDeleteAccount}
              disabled={confirmDeleteText !== "DELETE"}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-error-600 text-white hover:bg-error-700 disabled:opacity-40 transition"
            >
              Confirm Deletion
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
