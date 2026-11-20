"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { KhataCustomer, KhataEntry } from "@/types/khata";
import {
  getKhataCustomers,
  getKhataEntries,
  recordKhataPayment,
} from "@/data/khataStore";
import {
  DollarLineIcon,
  PlusIcon,
  TimeIcon,
} from "@/icons";
import Select from "@/components/form/Select";

export default function KhataPaymentsView() {
  const searchParams = useSearchParams();
  const initialClientId = searchParams?.get("clientId") || "all";

  const [customers, setCustomers] = useState<KhataCustomer[]>([]);
  const [entries, setEntries] = useState<KhataEntry[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialClientId);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetCustomerId, setTargetCustomerId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<KhataEntry["paymentMode"]>("bank_transfer");
  const [paymentNotes, setPaymentNotes] = useState("");

  const reloadData = () => {
    const custs = getKhataCustomers();
    setCustomers(custs);
    setEntries(getKhataEntries());
    if (custs.length > 0 && !targetCustomerId) {
      setTargetCustomerId(custs[0].id);
    }
  };

  useEffect(() => {
    reloadData();
    window.addEventListener("khata-data-updated", reloadData);
    return () => window.removeEventListener("khata-data-updated", reloadData);
  }, []);

  useEffect(() => {
    if (isPaymentModalOpen) {
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
  }, [isPaymentModalOpen]);

  const paymentEntries = useMemo(() => {
    return entries
      .filter((e) => e.type === "payment")
      .filter((e) => selectedCustomerId === "all" || e.customerId === selectedCustomerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, selectedCustomerId]);

  const totalCollected = useMemo(() => {
    return paymentEntries.reduce((sum, e) => sum + e.credit, 0);
  }, [paymentEntries]);

  const totalOutstanding = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.currentBalance, 0);
  }, [customers]);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(paymentAmount);
    if (!targetCustomerId || isNaN(val) || val <= 0) return;

    recordKhataPayment(
      targetCustomerId,
      val,
      paymentMode,
      paymentNotes || "Payment settlement received",
    );

    setPaymentAmount("");
    setPaymentNotes("");
    setIsPaymentModalOpen(false);
    reloadData();
  };

  const customerFilterOptions = useMemo(() => {
    return [
      { value: "all", label: "All Clients & Accounts" },
      ...customers.map((c) => ({
        value: c.id,
        label: `${c.commercialName} (Balance: €${c.currentBalance.toFixed(2)})`,
      })),
    ];
  }, [customers]);

  const targetCustomerOptions = useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label: `${c.commercialName} (Due: €${c.currentBalance.toFixed(2)})`,
    }));
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* ── 1. Top Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-gray-900 to-black p-6 sm:p-8 border border-emerald-900/40 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30">
                <DollarLineIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide font-outfit uppercase">
                  Payments & Collections
                </h1>
                <p className="text-xs text-emerald-400 font-medium">
                  Record Client Payments, Bank Settlements & Receipts
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 max-w-xl">
              Record payments received from hotels and clubs via wire transfer, cash, bizum, or credit card to automatically settle running balances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-md">
              <span className="block text-[11px] text-gray-400">Total Collected</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                €{totalCollected.toFixed(2)}
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-md">
              <span className="block text-[11px] text-gray-400">Total Outstanding</span>
              <span className="text-xl font-black text-rose-400 font-mono">
                €{totalOutstanding.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Filter & Action Bar with Custom Select ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3 w-full max-w-md">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Filter by Client:
          </label>
          <div className="w-full">
            <Select
              options={customerFilterOptions}
              value={selectedCustomerId}
              onChange={setSelectedCustomerId}
              placeholder="Filter by Client"
            />
          </div>
        </div>

        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* ── 3. Payments Table ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-start text-xs divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50/80 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5 text-start whitespace-nowrap">Date & Time</th>
                <th className="px-4 py-3.5 text-start whitespace-nowrap">Client Account</th>
                <th className="px-4 py-3.5 text-start whitespace-nowrap">Payment Mode</th>
                <th className="px-4 py-3.5 text-start">Reference / Notes</th>
                <th className="px-4 py-3.5 text-end whitespace-nowrap">Amount Received</th>
                <th className="px-4 py-3.5 text-end whitespace-nowrap">Updated Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70 bg-white dark:bg-gray-900">
              {paymentEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        <TimeIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-900 dark:text-white text-xs">
                          {new Date(entry.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
                          {new Date(entry.date).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 text-emerald-700 font-bold font-outfit text-xs uppercase border border-emerald-500/20 dark:from-emerald-950/70 dark:to-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800">
                        {entry.customerName.slice(0, 2)}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {entry.customerName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 capitalize">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {entry.paymentMode ? entry.paymentMode.replace("_", " ") : "Bank Transfer"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-gray-700 dark:text-gray-300 text-xs">
                      {entry.notes || entry.description}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-end font-mono font-black text-emerald-600 text-sm whitespace-nowrap">
                    -€{entry.credit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-end font-mono font-bold text-gray-900 dark:text-white text-xs whitespace-nowrap">
                    €{entry.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
              {paymentEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No payment collection records found for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. RECORD PAYMENT MODAL ── */}
      {isPaymentModalOpen && (
        <div className="modal-backdrop-active fixed inset-0 z-[999999] flex items-center justify-center bg-black/65 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 text-gray-900 dark:text-white">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <DollarLineIcon className="h-5 w-5 text-emerald-600" />
              <span>Record Client Payment</span>
            </h3>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Select Client Account</label>
                <Select
                  options={targetCustomerOptions}
                  value={targetCustomerId}
                  onChange={setTargetCustomerId}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Amount Received (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 500.00"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm font-mono dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Payment Method</label>
                <Select
                  options={[
                    { value: "bank_transfer", label: "Bank Transfer (Wire Transfer)" },
                    { value: "cash", label: "Cash (Efectivo)" },
                    { value: "bizum", label: "Bizum" },
                    { value: "card", label: "Credit / Debit Card" },
                  ]}
                  value={paymentMode || "bank_transfer"}
                  onChange={(val) => setPaymentMode(val as KhataEntry["paymentMode"])}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Bank Reference / Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Wire Ref #89214, Cheque receipt..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}