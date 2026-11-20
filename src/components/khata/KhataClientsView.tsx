"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { KhataCustomer } from "@/types/khata";
import {
  getKhataCustomers,
  addKhataCustomer,
  updateKhataCustomer,
} from "@/data/khataStore";
import {
  LeafIcon,
  PlusIcon,
  PencilIcon,
  DocsIcon,
  BoxCubeIcon,
} from "@/icons";
import Select from "@/components/form/Select";

export default function KhataClientsView() {
  const [customers, setCustomers] = useState<KhataCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Add Customer Modal State
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCommercialName, setNewCommercialName] = useState("");
  const [newLegalName, setNewLegalName] = useState("");
  const [newCifNif, setNewCifNif] = useState("");
  const [newContactPerson, setNewContactPerson] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("Valencia");
  const [newBusinessType, setNewBusinessType] = useState<KhataCustomer["businessType"]>("hotel");
  const [newCreditLimit, setNewCreditLimit] = useState("2000");
  const [newCreditDays, setNewCreditDays] = useState<15 | 30 | 0>(30);
  const [newInitialBalance, setNewInitialBalance] = useState("0");
  const [newNotes, setNewNotes] = useState("");

  // Edit Customer Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<KhataCustomer | null>(null);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [editCreditLimit, setEditCreditLimit] = useState("");
  const [editCreditDays, setEditCreditDays] = useState<15 | 30 | 0>(30);
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "blocked">("active");

  const reloadData = () => {
    setCustomers(getKhataCustomers());
  };

  useEffect(() => {
    reloadData();
    window.addEventListener("khata-data-updated", reloadData);
    return () => window.removeEventListener("khata-data-updated", reloadData);
  }, []);

  useEffect(() => {
    if (isAddCustomerModalOpen || isEditCustomerModalOpen) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "unset";
    };
  }, [isAddCustomerModalOpen, isEditCustomerModalOpen]);

  const totalOutstanding = useMemo(
    () => customers.reduce((sum, c) => sum + c.currentBalance, 0),
    [customers],
  );

  const totalCreditExtended = useMemo(
    () => customers.reduce((sum, c) => sum + c.creditLimit, 0),
    [customers],
  );

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.commercialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        filterType === "all" || c.businessType === filterType;

      return matchesSearch && matchesType;
    });
  }, [customers, searchQuery, filterType]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommercialName.trim() || !newContactPerson.trim() || !newPhone.trim()) return;

    addKhataCustomer({
      commercialName: newCommercialName.trim(),
      legalName: newLegalName.trim() || newCommercialName.trim(),
      cifNif: newCifNif.trim(),
      contactPerson: newContactPerson.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      address: newAddress.trim() || "Valencia, Spain",
      city: newCity.trim() || "Valencia",
      businessType: newBusinessType,
      creditLimit: parseFloat(newCreditLimit) || 1500,
      creditDays: newCreditDays,
      initialBalance: parseFloat(newInitialBalance) || 0,
      notes: newNotes.trim(),
    });

    setIsAddCustomerModalOpen(false);
    setNewCommercialName("");
    setNewLegalName("");
    setNewCifNif("");
    setNewContactPerson("");
    setNewPhone("");
    setNewEmail("");
    setNewAddress("");
    setNewInitialBalance("0");
    setNewNotes("");
    reloadData();
  };

  const openEditModal = (c: KhataCustomer) => {
    setSelectedCustomer(c);
    setEditCreditLimit(String(c.creditLimit));
    setEditCreditDays(c.creditDays);
    setEditContactPerson(c.contactPerson);
    setEditPhone(c.phone);
    setEditAddress(c.address);
    setEditStatus(c.status);
    setIsEditCustomerModalOpen(true);
  };

  const handleEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    updateKhataCustomer(selectedCustomer.id, {
      creditLimit: parseFloat(editCreditLimit) || selectedCustomer.creditLimit,
      creditDays: editCreditDays,
      contactPerson: editContactPerson.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
      status: editStatus,
    });

    setIsEditCustomerModalOpen(false);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Top Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-gray-900 to-black p-6 sm:p-8 border border-emerald-900/40 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30">
                <LeafIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide font-outfit uppercase">
                  B2B Client Accounts Directory
                </h1>
                <p className="text-xs text-emerald-400 font-medium">
                  Hotels, Clubs, Restaurants & Credit Limits Management
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 max-w-xl">
              Directory of all verified commercial clients, available credit limits, and running balances.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-md">
              <span className="block text-[11px] text-gray-400">Total Outstanding</span>
              <span className="text-xl font-black text-rose-400 font-mono">
                €{totalOutstanding.toFixed(2)}
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-md">
              <span className="block text-[11px] text-gray-400">Total Credit Line</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                €{totalCreditExtended.toFixed(2)}
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-md">
              <span className="block text-[11px] text-gray-400">Total Clients</span>
              <span className="text-xl font-black text-white">
                {customers.length} Premises
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Filter & Add New Client Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-1 items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hotel, club, chef name, or phone..."
            className="w-full max-w-sm rounded-xl border border-gray-300 px-3.5 py-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <div className="w-56">
            <Select
              options={[
                { value: "all", label: "All Client Types" },
                { value: "hotel", label: "Hotels" },
                { value: "restaurante", label: "Restaurants & Clubs" },
                { value: "bar", label: "Bars" },
                { value: "cafeteria", label: "Cafeterias" },
              ]}
              value={filterType}
              onChange={setFilterType}
              placeholder="Filter by Type"
            />
          </div>
        </div>

        <button
          onClick={() => setIsAddCustomerModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add New Client Account</span>
        </button>
      </div>

      {/* ── 3. Clients Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => {
          const availableCredit = Math.max(0, c.creditLimit - c.currentBalance);
          const percentUsed = Math.min(100, Math.round((c.currentBalance / (c.creditLimit || 1)) * 100));

          return (
            <div
              key={c.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-outfit font-black text-sm uppercase dark:bg-emerald-500/20 dark:text-emerald-400">
                      {c.commercialName.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                        {c.commercialName}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
                        {c.businessType} • Tax ID: {c.cifNif}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      c.status === "active"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                    }`}
                  >
                    {c.status === "active" ? "Active" : "Blocked"}
                  </span>
                </div>

                {/* Contact & Address */}
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="flex items-center justify-between">
                    <span className="text-gray-500 text-[11px]">Chef / In-Charge:</span>
                    <strong className="text-gray-900 dark:text-white">{c.contactPerson}</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-gray-500 text-[11px]">Phone / WhatsApp:</span>
                    <a
                      href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-emerald-600 hover:underline"
                    >
                      {c.phone}
                    </a>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-gray-500 text-[11px]">Address:</span>
                    <span className="truncate max-w-[170px]" title={c.address}>
                      {c.address}
                    </span>
                  </p>
                </div>

                {/* Credit Limit & Balance Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500 text-[11px]">Outstanding Balance:</span>
                    <span className="font-mono font-black text-rose-600">
                      €{c.currentBalance.toFixed(2)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percentUsed > 85
                          ? "bg-rose-500"
                          : percentUsed > 60
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>Limit: €{c.creditLimit.toFixed(2)}</span>
                    <span className="text-emerald-600 font-bold">
                      Available: €{availableCredit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-1.5 text-xs">
                <button
                  onClick={() => openEditModal(c)}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 text-[11px]"
                >
                  <PencilIcon className="h-3 w-3 text-emerald-600" />
                  <span>Edit Limit</span>
                </button>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/khata/challans?clientId=${c.id}`}
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px]"
                    title="Delivery Notes"
                  >
                    <BoxCubeIcon className="h-3 w-3" />
                    <span>Slips</span>
                  </Link>

                  <Link
                    href={`/khata/invoices?clientId=${c.id}`}
                    className="flex items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1.5 font-bold text-white hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-[11px]"
                    title="Monthly Invoice"
                  >
                    <DocsIcon className="h-3 w-3" />
                    <span>Invoice</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. ADD NEW B2B CUSTOMER MODAL ── */}
      {isAddCustomerModalOpen && (
        <div className="modal-backdrop-active fixed inset-0 z-[999999] flex items-center justify-center bg-black/65 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 text-gray-900 dark:text-white my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <PlusIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Add New Corporate Client</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Register a new hotel, club, or restaurant with credit terms
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs pt-3">
              <div>
                <label className="block font-bold mb-1">Business Name (Hotel / Club / Restaurant) *</label>
                <input
                  type="text"
                  required
                  value={newCommercialName}
                  onChange={(e) => setNewCommercialName(e.target.value)}
                  placeholder="e.g. Hotel Carlton / Royal Golf Club"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Contact Person (Chef / Manager) *</label>
                  <input
                    type="text"
                    required
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    placeholder="e.g. Chef Aslam / Laura Benítez"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+34 612 345 678"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Business Type</label>
                  <Select
                    options={[
                      { value: "hotel", label: "Hotel" },
                      { value: "restaurante", label: "Restaurant & Club" },
                      { value: "bar", label: "Bar" },
                      { value: "cafeteria", label: "Cafeteria" },
                      { value: "particular", label: "VIP Customer" },
                    ]}
                    value={newBusinessType}
                    onChange={(val) => setNewBusinessType(val as KhataCustomer["businessType"])}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Payment Term (Days)</label>
                  <Select
                    options={[
                      { value: "30", label: "30 Days Credit" },
                      { value: "15", label: "15 Days Credit" },
                      { value: "0", label: "Cash on Delivery" },
                    ]}
                    value={String(newCreditDays)}
                    onChange={(val) => setNewCreditDays(parseInt(val) as 15 | 30 | 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 whitespace-nowrap">Credit Limit (€) *</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={newCreditLimit}
                    onChange={(e) => setNewCreditLimit(e.target.value)}
                    placeholder="e.g. 2000"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 font-mono dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    Opening Balance (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newInitialBalance}
                    onChange={(e) => setNewInitialBalance(e.target.value)}
                    placeholder="e.g. 350.00"
                    className="w-full rounded-xl border border-emerald-300 px-3 py-2 font-mono dark:bg-gray-800 dark:border-emerald-700"
                  />
                  <span className="text-[10px] text-gray-500 block truncate">Transferred from previous manual ledger.</span>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. Calle Gran Vía, 42, Valencia"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Delivery Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Kitchen timing, delivery notes..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700"
                >
                  Create Client Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. EDIT CUSTOMER & LIMIT MODAL ── */}
      {isEditCustomerModalOpen && selectedCustomer && (
        <div className="modal-backdrop-active fixed inset-0 z-[999999] flex items-center justify-center bg-black/65 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PencilIcon className="h-4 w-4 text-emerald-600" />
                <span>Edit Limit: {selectedCustomer.commercialName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditCustomerModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditCustomer} className="space-y-3.5 text-xs pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Credit Limit (€)</label>
                  <input
                    type="number"
                    step="50"
                    required
                    value={editCreditLimit}
                    onChange={(e) => setEditCreditLimit(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 font-mono dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Credit Terms</label>
                  <Select
                    options={[
                      { value: "30", label: "30 Days Credit" },
                      { value: "15", label: "15 Days Credit" },
                      { value: "0", label: "Cash on Delivery" },
                    ]}
                    value={String(editCreditDays)}
                    onChange={(val) => setEditCreditDays(parseInt(val) as 15 | 30 | 0)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Chef / Contact Person</label>
                <input
                  type="text"
                  value={editContactPerson}
                  onChange={(e) => setEditContactPerson(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Account Status</label>
                <Select
                  options={[
                    { value: "active", label: "Active (Orders Allowed)" },
                    { value: "blocked", label: "Blocked (Payment Pending)" },
                  ]}
                  value={editStatus}
                  onChange={(val) => setEditStatus(val as "active" | "blocked")}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditCustomerModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}