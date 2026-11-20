"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { KhataCustomer, KhataEntry } from "@/types/khata";
import {
  getKhataCustomers,
  getKhataEntries,
  recordKhataPurchase,
  SUPERBARRIO_FISCAL_DATA,
} from "@/data/khataStore";
import {
  BoxCubeIcon,
  DocsIcon,
  DownloadIcon,
  PlusIcon,
  SearchIcon,
  TimeIcon,
  CloseIcon,
} from "@/icons";
import Select from "@/components/form/Select";

export default function KhataChallansView() {
  const searchParams = useSearchParams();
  const initialClientId = searchParams?.get("clientId") || "all";

  const [customers, setCustomers] = useState<KhataCustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialClientId);
  const [entries, setEntries] = useState<KhataEntry[]>([]);

  // Delivery Challan (Albarán de Entrega) Modal State
  const [selectedChallanEntry, setSelectedChallanEntry] = useState<KhataEntry | null>(null);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [deliveryBoyName, setDeliveryBoyName] = useState("Express Delivery Team");

  // Record Supply Delivery Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [targetCustomerId, setTargetCustomerId] = useState("");
  const [itemName, setItemName] = useState("Alhambra Beer Can 33 cl");
  const [itemCode, setItemCode] = useState("0763620");
  const [boxes, setBoxes] = useState(2);
  const [unitsPerBox, setUnitsPerBox] = useState(24);
  const [itemPrice, setItemPrice] = useState(0.414);
  const [ivaRate, setIvaRate] = useState<4 | 10 | 21>(21);
  const [purchaseNotes, setPurchaseNotes] = useState("");

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
    if (isPurchaseModalOpen || isChallanModalOpen) {
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
  }, [isPurchaseModalOpen, isChallanModalOpen]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPurchaseEntries = useMemo(() => {
    return entries
      .filter((e) => e.type === "purchase")
      .filter((e) => selectedCustomerId === "all" || e.customerId === selectedCustomerId)
      .filter((e) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const matchesClient = (e.customerName || "").toLowerCase().includes(q);
        const matchesFactura = (e.facturaNumber || "").toLowerCase().includes(q);
        const matchesDesc = (e.description || "").toLowerCase().includes(q);
        const matchesItems = e.items?.some((it) => it.name.toLowerCase().includes(q));
        const matchesNotes = (e.notes || "").toLowerCase().includes(q);
        return matchesClient || matchesFactura || matchesDesc || matchesItems || matchesNotes;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, selectedCustomerId, searchQuery]);

  const totalDeliveredValue = useMemo(() => {
    return filteredPurchaseEntries.reduce((sum, e) => sum + e.debit, 0);
  }, [filteredPurchaseEntries]);

  const handleOpenChallan = (entry: KhataEntry) => {
    setSelectedChallanEntry(entry);
    setIsChallanModalOpen(true);
  };

  const handleRecordPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomerId || !itemName || boxes <= 0) return;

    const totalUnits = boxes * unitsPerBox;
    const totalWithIva = Number((totalUnits * itemPrice).toFixed(2));
    const priceWithoutIva = Number((itemPrice / (1 + ivaRate / 100)).toFixed(3));

    const breakdown = [
      {
        id: `p-${Date.now()}`,
        code: itemCode,
        name: itemName,
        nameEs: itemName.toUpperCase(),
        boxes,
        unitsPerBox,
        quantity: totalUnits,
        unit: "Units",
        ivaRate,
        priceWithoutIva,
        priceWithIva: itemPrice,
        total: totalWithIva,
      },
    ];

    recordKhataPurchase(
      targetCustomerId,
      breakdown,
      totalWithIva,
      `${itemName} (${boxes} Boxes = ${totalUnits} Units)`,
      undefined,
      purchaseNotes || "Commercial delivery to client premises",
    );

    setIsPurchaseModalOpen(false);
    reloadData();
  };

  const challanCustomer = useMemo(() => {
    if (!selectedChallanEntry) return null;
    return customers.find((c) => c.id === selectedChallanEntry.customerId) || {
      commercialName: selectedChallanEntry.customerName,
      legalName: selectedChallanEntry.customerName,
      cifNif: selectedChallanEntry.cifNif || "N/A",
      address: "Valencia",
      city: "Valencia",
      phone: "+34 600 000 000",
      contactPerson: "Chef / In-Charge",
      creditDays: 30,
    };
  }, [selectedChallanEntry, customers]);

  const customerFilterOptions = useMemo(() => {
    return [
      { value: "all", label: "All Clients & Accounts" },
      ...customers.map((c) => ({
        value: c.id,
        label: `${c.commercialName} (${c.contactPerson})`,
      })),
    ];
  }, [customers]);

  const targetCustomerOptions = useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label: `${c.commercialName} (${c.contactPerson})`,
    }));
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* ── Print Styling for Delivery Challan ── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #delivery-challan-printable,
          #delivery-challan-printable * {
            visibility: visible;
          }
          #delivery-challan-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15px 20px;
            background: white !important;
            color: black !important;
            font-size: 11px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ── 1. Top Header Banner ── */}
      <div className="no-print relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-gray-900 to-black p-6 sm:p-8 border border-emerald-900/40 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30">
                <DocsIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide font-outfit uppercase">
                  Delivery Notes & Challans
                </h1>
                <p className="text-xs text-emerald-400 font-medium">
                  Official Delivery Slips with Receiver Signatures & Stamps
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 max-w-xl">
              Print official delivery receiving slips for delivery drivers to obtain signatures and stamps upon delivery to prevent end-of-month disputes.
            </p>
          </div>

          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Record Delivery Note</span>
          </button>
        </div>
      </div>

      {/* ── 2. Modern Filter & Search Bar with Custom Select ── */}
      <div className="no-print rounded-2xl bg-white p-4 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by Note #, Client, Item, or Notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Client Filter Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-64 sm:w-72">
              <Select
                options={customerFilterOptions}
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                placeholder="Filter by Client"
              />
            </div>

            {/* Quick Metrics Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/80 px-3 py-1.5 border border-gray-200/70 dark:border-gray-700 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Total Value:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                €{totalDeliveredValue.toFixed(2)}
              </span>
            </div>

            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap px-1">
              {filteredPurchaseEntries.length} Slips
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Modern Challans Table ── */}
      <div className="no-print rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-start text-xs divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50/80 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5 text-start whitespace-nowrap">Date & Time</th>
                <th className="px-4 py-3.5 text-start whitespace-nowrap">Delivery Note #</th>
                <th className="px-4 py-3.5 text-start whitespace-nowrap">Client Account</th>
                <th className="px-4 py-3.5 text-start">Items Delivered</th>
                <th className="px-4 py-3.5 text-end whitespace-nowrap">Total Amount</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70 bg-white dark:bg-gray-900">
              {filteredPurchaseEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                >
                  {/* Date & Time */}
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

                  {/* Delivery Note Number */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80">
                      <DocsIcon className="h-3.5 w-3.5 opacity-70" />
                      <span>{entry.facturaNumber || `DEL-${entry.id.slice(-6)}`}</span>
                    </span>
                  </td>

                  {/* Client Account */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 text-emerald-700 font-bold font-outfit text-xs uppercase border border-emerald-500/20 dark:from-emerald-950/70 dark:to-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800">
                        {entry.customerName.slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block text-xs">
                          {entry.customerName}
                        </span>
                        <span
                          className="text-[11px] text-gray-500 dark:text-gray-400 block truncate max-w-[180px]"
                          title={entry.notes || "Commercial Delivery"}
                        >
                          {entry.notes || "Commercial Delivery"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Items Delivered - Compact, Professional & Expandable */}
                  <td className="px-4 py-3.5">
                    <div className="max-w-[340px]">
                      <span
                        className="font-semibold text-gray-900 dark:text-gray-100 block text-xs truncate mb-1"
                        title={entry.description}
                      >
                        {entry.description}
                      </span>
                      {entry.items && entry.items.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {entry.items.slice(0, 2).map((it, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md truncate max-w-[145px]"
                              title={`${it.quantity}x ${it.name} (€${it.total.toFixed(2)})`}
                            >
                              <strong className="font-bold mr-1 text-emerald-600 dark:text-emerald-400">
                                {it.quantity}x
                              </strong>
                              <span className="truncate">{it.name}</span>
                            </span>
                          ))}
                          {entry.items.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleOpenChallan(entry)}
                              className="inline-flex items-center text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                              title={entry.items.slice(2).map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                            >
                              +{entry.items.length - 2} more items
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Total Amount */}
                  <td className="px-4 py-3.5 text-end whitespace-nowrap">
                    <span className="font-mono font-black text-gray-900 dark:text-white text-sm block">
                      €{entry.debit.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 block">
                      Incl. VAT
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpenChallan(entry)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white active:scale-95 transition-all cursor-pointer"
                      title="Preview and Print Delivery Slip"
                    >
                      <DownloadIcon className="h-3.5 w-3.5" />
                      <span>Print Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPurchaseEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
                      <BoxCubeIcon className="h-6 w-6" />
                    </div>
                    <h4 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                      No delivery slips found
                    </h4>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {searchQuery || selectedCustomerId !== "all"
                        ? "Try adjusting your search query or client filter."
                        : "No delivery slips recorded yet. Click 'Record Delivery Note' above."}
                    </p>
                    {(searchQuery || selectedCustomerId !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCustomerId("all");
                        }}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        Reset filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. RECORD NEW SUPPLY DELIVERY MODAL ── */}
      {isPurchaseModalOpen && (
        <div className="modal-backdrop-active fixed inset-0 z-[999999] flex items-center justify-center bg-black/65 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 text-gray-900 dark:text-white">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <BoxCubeIcon className="h-5 w-5 text-gray-700" />
              <span>Record New Delivery Note</span>
            </h3>
            <form onSubmit={handleRecordPurchase} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Select Client Account</label>
                <Select
                  options={targetCustomerOptions}
                  value={targetCustomerId}
                  onChange={setTargetCustomerId}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Item Description / Product</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Boxes / Crates</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={boxes}
                    onChange={(e) => setBoxes(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-1.5 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Units per Box</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={unitsPerBox}
                    onChange={(e) => setUnitsPerBox(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-1.5 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Unit Price (€)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-1.5 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">VAT Rate</label>
                  <Select
                    options={[
                      { value: "21", label: "21% (Standard / Beverages)" },
                      { value: "10", label: "10% (Food & Groceries)" },
                      { value: "4", label: "4% (Super-reduced / Dairy, Bread)" },
                    ]}
                    value={String(ivaRate)}
                    onChange={(val) => setIvaRate(parseInt(val) as 4 | 10 | 21)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Delivery Notes</label>
                <input
                  type="text"
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  placeholder="e.g. Delivered to rear kitchen entrance..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-1.5 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-white font-bold hover:bg-emerald-700 shadow-sm"
                >
                  Save Delivery Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. PRINTABLE DELIVERY CHALLAN MODAL ── */}
      {isChallanModalOpen && selectedChallanEntry && challanCustomer && (
        <div className="modal-backdrop-active fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 text-gray-900 dark:text-white my-6 max-h-[95vh] overflow-y-auto">
            <div className="no-print flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <DocsIcon className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-base">
                  Delivery Slip (Proof of Delivery)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
                >
                  <DownloadIcon className="h-4 w-4" />
                  <span>Print Delivery Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsChallanModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold p-1 text-sm"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="no-print mb-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 border border-gray-200 dark:border-gray-700 flex items-center gap-3 text-xs">
              <label className="font-bold whitespace-nowrap">Delivery Driver Name:</label>
              <input
                type="text"
                value={deliveryBoyName}
                onChange={(e) => setDeliveryBoyName(e.target.value)}
                placeholder="Driver name..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 dark:bg-gray-800 text-xs"
              />
            </div>

            {/* ── PRINTABLE CHALLAN AREA ── */}
            <div
              id="delivery-challan-printable"
              className="border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-white text-gray-900"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-gray-800">
                <div>
                  <h1 className="text-xl font-black font-outfit uppercase tracking-wider text-emerald-800">
                    {SUPERBARRIO_FISCAL_DATA.companyName}
                  </h1>
                  <p className="text-[11px] text-gray-600 font-mono">
                    CIF: {SUPERBARRIO_FISCAL_DATA.cif} • Tel: {SUPERBARRIO_FISCAL_DATA.phone}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {SUPERBARRIO_FISCAL_DATA.address}, {SUPERBARRIO_FISCAL_DATA.postalCode} {SUPERBARRIO_FISCAL_DATA.city}
                  </p>
                </div>
                <div className="text-end">
                  <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-mono font-black text-emerald-800">
                    DELIVERY NOTE / ALBARÁN
                  </span>
                  <p className="text-xs font-mono font-bold mt-1 text-gray-800">
                    No: {selectedChallanEntry.facturaNumber || `DEL-${selectedChallanEntry.id.slice(-6)}`}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Date: {new Date(selectedChallanEntry.date).toLocaleDateString("en-GB")} {new Date(selectedChallanEntry.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Client Info */}
              <div className="my-4 rounded-xl bg-gray-50 border border-gray-200 p-3.5 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-gray-500">
                      Client / Commercial Account:
                    </span>
                    <p className="text-sm font-black text-gray-900">
                      {challanCustomer.commercialName}
                    </p>
                    <p className="text-[11px] text-gray-600">
                      Legal Name: {challanCustomer.legalName} • Tax ID: {challanCustomer.cifNif}
                    </p>
                    <p className="text-[11px] text-gray-700 font-medium">
                      Address: {challanCustomer.address}, {challanCustomer.city}
                    </p>
                  </div>
                  <div className="text-end sm:text-start">
                    <span className="block text-[10px] font-bold uppercase text-gray-500">
                      Chef / Contact:
                    </span>
                    <p className="text-xs font-bold text-gray-800">
                      {challanCustomer.contactPerson}
                    </p>
                    <p className="text-[11px] text-gray-600">
                      Phone: {challanCustomer.phone}
                    </p>
                    <p className="text-[11px] font-bold text-purple-700 mt-1">
                      Terms: Commercial Credit ({challanCustomer.creditDays} Days)
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-start text-xs border border-gray-200 my-3">
                <thead className="bg-gray-100 font-bold text-gray-700 text-[11px] uppercase">
                  <tr>
                    <th className="px-3 py-2 text-start border-b border-gray-200">Item / Description</th>
                    <th className="px-3 py-2 text-center border-b border-gray-200">Quantity</th>
                    <th className="px-3 py-2 text-end border-b border-gray-200">Unit Price</th>
                    <th className="px-3 py-2 text-end border-b border-gray-200">Total (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedChallanEntry.items && selectedChallanEntry.items.length > 0 ? (
                    selectedChallanEntry.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {it.name}
                          {it.boxes ? (
                            <span className="block text-[10px] text-gray-500">
                              {it.boxes} boxes ({it.unitsPerBox || 1} units/box)
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-gray-800">
                          {it.quantity} {it.unit || "units"}
                        </td>
                        <td className="px-3 py-2 text-end font-mono">
                          €{(it.priceWithIva || it.price || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-end font-mono font-bold">
                          €{it.total.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-2 font-medium" colSpan={3}>
                        {selectedChallanEntry.description}
                      </td>
                      <td className="px-3 py-2 text-end font-mono font-bold">
                        €{selectedChallanEntry.debit.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total Summary */}
              <div className="flex justify-end pt-2 pb-3">
                <div className="w-56 rounded-xl bg-gray-50 border border-gray-200 p-2.5 text-end text-xs">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase">
                    Total Amount (Incl. VAT):
                  </span>
                  <span className="font-mono text-xl font-black text-gray-900">
                    €{selectedChallanEntry.debit.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Signature / Receiving Confirmation Section */}
              <div className="mt-4 pt-4 border-t-2 border-gray-300">
                <p className="text-[10px] text-gray-500 mb-4 text-center italic">
                  "The receiver confirms receipt of all items in good condition and accepts charging to their monthly commercial credit account."
                </p>
                <div className="grid grid-cols-2 gap-8 text-xs">
                  {/* Delivery Driver Sign */}
                  <div className="border border-gray-300 rounded-xl p-3 text-center bg-gray-50/50">
                    <span className="block text-[10px] font-bold text-gray-500 uppercase mb-8">
                      Delivered By (Driver):
                    </span>
                    <div className="border-b border-gray-400 w-3/4 mx-auto mb-1"></div>
                    <span className="font-bold text-[11px] text-gray-800 block">
                      {deliveryBoyName}
                    </span>
                  </div>

                  {/* Chef / Receiver Sign */}
                  <div className="border border-gray-300 rounded-xl p-3 text-center bg-gray-50/50">
                    <span className="block text-[10px] font-bold text-gray-500 uppercase mb-8">
                      Received By (Chef / Receiver):
                    </span>
                    <div className="border-b border-gray-400 w-3/4 mx-auto mb-1"></div>
                    <span className="font-bold text-[11px] text-gray-800 block">
                      Signature & Stamp
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}