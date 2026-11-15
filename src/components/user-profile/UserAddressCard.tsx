"use client";

import React, { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { PencilIcon } from "@/icons";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { useAdminProfile } from "@/context/ProfileContext";
import { toast } from "sonner";

export default function UserAddressCard() {
  const { profile, updateProfile, isSaving } = useAdminProfile();
  const { isOpen, openModal, closeModal } = useModal();

  const [country, setCountry] = useState(profile.country);
  const [cityState, setCityState] = useState(profile.cityState);
  const [postalCode, setPostalCode] = useState(profile.postalCode);
  const [taxId, setTaxId] = useState(profile.taxId);

  useEffect(() => {
    if (isOpen) {
      setCountry(profile.country);
      setCityState(profile.cityState);
      setPostalCode(profile.postalCode);
      setTaxId(profile.taxId);
    }
  }, [isOpen, profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!country.trim() || !cityState.trim() || !postalCode.trim()) {
      toast.error("Please fill in all address fields.");
      return;
    }

    const success = await updateProfile({
      country: country.trim(),
      cityState: cityState.trim(),
      postalCode: postalCode.trim(),
      taxId: taxId.trim(),
    });

    if (success) {
      toast.success("Store & address details updated!");
      closeModal();
    } else {
      toast.error("Failed to update address. Please try again.");
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
        <div className="flex flex-col gap-6 sm:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h4 className="mb-4 text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
              Store & Fiscal Address
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Country
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.country || "España"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  City / State
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.cityState || "Madrid, España"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Postal Code
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.postalCode || "28013"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  TAX / CIF ID
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.taxId || "B-88392011"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <PencilIcon className="size-4" />
            Edit Address
          </button>
        </div>
      </div>

      {/* Edit Address Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[600px]">
        <div className="relative no-scrollbar w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
          <div className="mb-6">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Address & Fiscal Details
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update fiscal information for official grocery invoice receipts.
            </p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <Label>Country *</Label>
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="España"
                required
              />
            </div>

            <div>
              <Label>City / State *</Label>
              <Input
                type="text"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                placeholder="Madrid, España"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Postal Code *</Label>
                <Input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="28013"
                  required
                />
              </div>

              <div>
                <Label>TAX / NIF / CIF ID *</Label>
                <Input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="B-88392011"
                  required
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
