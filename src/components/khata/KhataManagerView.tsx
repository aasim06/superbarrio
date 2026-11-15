"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  KhataCustomer,
  KhataEntry,
  MonthlyKhataInvoice,
} from "@/types/khata";
import {
  getKhataCustomers,
  getCustomerKhataLedger,
  recordKhataPayment,
  recordKhataPurchase,
  generateMonthlyInvoice,
  generateWhatsAppBillText,
  SUPERBARRIO_FISCAL_DATA,
} from "@/data/khataStore";
import {
  LeafIcon,
  WhatsAppIcon,
  DollarLineIcon,
  BoxCubeIcon,
  DocsIcon,
  TableIcon,
  DownloadIcon,
  CopyIcon,
} from "@/icons";
import CustomSelect, { CustomSelectOption } from "@/components/ui/dropdown/CustomSelect";
import Pagination from "@/components/tables/Pagination";

export default function KhataManagerView() {
  const t = useTranslations("b2bInvoices");

  const [customers, setCustomers] = useState<KhataCustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] =
    useState<string>("khata-bar-03");
  const [activeTab, setActiveTab] = useState<"factura" | "ledger">("factura");

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] =
    useState<KhataEntry["paymentMode"]>("bank_transfer");
  const [paymentNotes, setPaymentNotes] = useState("");

  // New Purchase Entry Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [itemCode, setItemCode] = useState("0763620");
  const [itemName, setItemName] = useState("Cerveza Lata Alhambra 33 cl");
  const [boxes, setBoxes] = useState(2);
  const [unitsPerBox, setUnitsPerBox] = useState(24);
  const [itemPrice, setItemPrice] = useState(0.414);
  const [ivaRate, setIvaRate] = useState<4 | 10 | 21>(21);
  const [purchaseNotes, setPurchaseNotes] = useState("");

  // Copy notification
  const [copySuccess, setCopySuccess] = useState(false);

  // Reload data
  const reloadData = () => {
    const list = getKhataCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    reloadData();
    window.addEventListener("khata-data-updated", reloadData);
    return () => window.removeEventListener("khata-data-updated", reloadData);
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId],
  );

  const customerLedger = useMemo(() => {
    if (!selectedCustomerId) return [];
    return getCustomerKhataLedger(selectedCustomerId);
  }, [selectedCustomerId, customers]);

  // Pagination for Ledger
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledgerItemsPerPage = 6;
  const ledgerTotalPages = Math.ceil(customerLedger.length / ledgerItemsPerPage) || 1;
  const paginatedLedger = useMemo(() => {
    const s = (ledgerPage - 1) * ledgerItemsPerPage;
    return customerLedger.slice(s, s + ledgerItemsPerPage);
  }, [customerLedger, ledgerPage, ledgerItemsPerPage]);

  useEffect(() => {
    setLedgerPage(1);
  }, [selectedCustomerId]);

  const monthlyInvoice = useMemo(() => {
    if (!selectedCustomerId) return null;
    return generateMonthlyInvoice(selectedCustomerId, "Noviembre 2026", 10, 2026);
  }, [selectedCustomerId, customerLedger]);

  const totalB2BDebt = customers.reduce((sum, c) => sum + c.currentBalance, 0);

  // Record Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(paymentAmount);
    if (!val || val <= 0 || !selectedCustomerId) return;

    recordKhataPayment(
      selectedCustomerId,
      val,
      paymentMode,
      paymentNotes || "Cobro de factura / Payment received",
    );

    setPaymentAmount("");
    setPaymentNotes("");
    setIsPaymentModalOpen(false);
    reloadData();
  };

  // Record Manual Purchase
  const handleRecordPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !itemName || boxes <= 0) return;

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
        unit: "Unidades",
        ivaRate,
        priceWithoutIva,
        priceWithIva: itemPrice,
        total: totalWithIva,
      },
    ];

    recordKhataPurchase(
      selectedCustomerId,
      breakdown,
      totalWithIva,
      `${itemName} (${boxes} Cajas = ${totalUnits} Unidades)`,
      undefined,
      purchaseNotes || "Albarán de entrega a local",
    );

    setIsPurchaseModalOpen(false);
    reloadData();
  };

  // WhatsApp Share
  const handleSendWhatsApp = () => {
    if (!monthlyInvoice) return;
    const text = generateWhatsAppBillText(monthlyInvoice);
    const cleanPhone = monthlyInvoice.customer.phone.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Copy Text
  const handleCopyBill = () => {
    if (!monthlyInvoice) return;
    const text = generateWhatsAppBillText(monthlyInvoice);
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ── Print Styling for Spanish Factura ── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-spanish-factura,
          #official-spanish-factura * {
            visibility: visible;
          }
          #official-spanish-factura {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10px 15px;
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
                <LeafIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide font-outfit uppercase">
                  {t("bannerTitle")}
                </h1>
                <p className="text-xs text-emerald-400 font-medium">
                  {t("bannerSubtitle")}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 max-w-xl">
              {t("bannerDescription")}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-md">
              <span className="block text-[11px] text-gray-400">
                {t("totalPending")}
              </span>
              <span className="text-xl font-black text-emerald-400">
                €{totalB2BDebt.toFixed(2)}
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-md">
              <span className="block text-[11px] text-gray-400">
                {t("hospitalityClients")}
              </span>
              <span className="text-xl font-black text-white">
                {customers.length} {t("premises")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Bar & Hotel Selection Bar ── */}
      <div className="no-print rounded-2xl bg-white p-4 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t("selectClient")}
            </span>
            <div className="flex flex-wrap gap-2">
              {customers.map((c) => {
                const isSelected = c.id === selectedCustomerId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      {c.commercialName}
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        isSelected
                          ? "bg-emerald-700 text-emerald-100"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      €{c.currentBalance.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95"
            >
              <DollarLineIcon className="h-4 w-4" />
              <span>{t("collectPayment")}</span>
            </button>
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 active:scale-95"
            >
              <BoxCubeIcon className="h-4 w-4" />
              <span>{t("newSupply")}</span>
            </button>
          </div>
        </div>

        {/* Selected Client Info Card */}
        {selectedCustomer && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 text-sm font-black font-outfit uppercase tracking-wider dark:bg-emerald-500/20 dark:text-emerald-400">
                {selectedCustomer.commercialName.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedCustomer.commercialName}
                  </h2>
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    NIF: {selectedCustomer.cifNif}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                  <span>Razón Social: {selectedCustomer.legalName}</span>
                  <span>•</span>
                  <span>{selectedCustomer.address}, {selectedCustomer.city}</span>
                  <span>•</span>
                  <span>Tel: {selectedCustomer.phone}</span>
                </div>
              </div>
            </div>

            {/* Credit Conditions */}
            <div className="flex items-center gap-6">
              <div>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                  {t("paymentTerms")}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedCustomer.creditDays > 0
                    ? t("creditDays", { days: selectedCustomer.creditDays })
                    : t("cashOnDelivery")}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                  {t("currentPendingBalance")}
                </span>
                <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                  €{selectedCustomer.currentBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Tabs Navigation ── */}
      <div className="no-print flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("factura")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === "factura"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <DocsIcon className="h-4 w-4" />
          <span>{t("tabOfficialInvoice")}</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            {t("a4PrintBadge")}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === "ledger"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <TableIcon className="h-4 w-4" />
          <span>{t("tabDeliveryNotes")}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {customerLedger.length}
          </span>
        </button>
      </div>

      {/* ── 4. TAB 1: OFFICIAL SPANISH FACTURA (MODELO OFICIAL EXACTO) ── */}
      {activeTab === "factura" && monthlyInvoice && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("invoiceNum")}:
              </span>
              <span className="font-mono font-bold text-emerald-600">
                {monthlyInvoice.invoiceNumber}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500">
                {t("dueDate")}: <strong>{monthlyInvoice.dueDate}</strong> (
                {monthlyInvoice.paymentTerms})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* WhatsApp Share */}
              <button
                onClick={handleSendWhatsApp}
                className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-md shadow-green-500/20 transition-all hover:bg-[#20ba59] active:scale-95"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>{t("sendWhatsApp")}</span>
              </button>

              {/* Copy summary */}
              <button
                onClick={handleCopyBill}
                className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                <span>{copySuccess ? t("copied") : t("copySummary")}</span>
              </button>

              {/* Print A4 */}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-black dark:bg-gray-800"
              >
                <DownloadIcon className="h-4 w-4" />
                <span>{t("printA4")}</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* ── THE OFFICIAL SPANISH FACTURA DOCUMENT (DIALSUR STYLE) ── */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div
            id="official-spanish-factura"
            className="rounded-2xl bg-white p-4 sm:p-8 md:p-10 shadow-2xl border-2 border-gray-300 text-gray-900 max-w-4xl mx-auto font-sans text-xs overflow-x-auto"
          >
            {/* Header: SuperBarrio Logo & Company Data */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b-2 border-emerald-700 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <LeafIcon className="h-5 w-5" />
                  </div>
                  <h2 className="font-outfit text-xl font-black uppercase tracking-wider text-emerald-800">
                    {SUPERBARRIO_FISCAL_DATA.companyName}
                  </h2>
                </div>
                <p className="font-mono text-[11px] text-gray-700 font-bold">
                  CIF: {SUPERBARRIO_FISCAL_DATA.cif}
                </p>
                <p className="text-[11px] text-gray-600">
                  {SUPERBARRIO_FISCAL_DATA.address} • {SUPERBARRIO_FISCAL_DATA.postalCode} {SUPERBARRIO_FISCAL_DATA.city} ({SUPERBARRIO_FISCAL_DATA.province})
                </p>
                <p className="text-[10px] text-gray-500">
                  Tel: {SUPERBARRIO_FISCAL_DATA.phone} • Email: {SUPERBARRIO_FISCAL_DATA.email}
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5">
                  {SUPERBARRIO_FISCAL_DATA.registroMercantil}
                </p>
              </div>

              {/* Factura Box */}
              <div className="text-start sm:text-end">
                <div className="border border-gray-400 rounded-lg p-2.5 bg-gray-50 w-full sm:min-w-[220px] sm:w-auto">
                  <h3 className="font-mono font-black text-sm uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 text-center">
                    FACTURA
                  </h3>
                  <div className="mt-1.5 space-y-0.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t("dateAndInvoice")}:</span>
                      <span className="font-mono font-bold">{monthlyInvoice.issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t("invoiceNum")}:</span>
                      <span className="font-mono font-bold text-emerald-800">
                        {monthlyInvoice.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nº Cliente:</span>
                      <span className="font-mono font-bold">
                        {monthlyInvoice.customer.id.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t("paymentTerms")}:</span>
                      <span className="font-bold text-emerald-700">
                        {monthlyInvoice.paymentTerms}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Data Box (Hostelería Bar / Hotel) */}
            <div className="my-4 border border-gray-300 rounded-xl p-3.5 bg-gray-50/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                {t("clientData")}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    {monthlyInvoice.customer.commercialName}
                  </h4>
                  <p className="text-[11px] text-gray-700 font-medium">
                    Razón Social: {monthlyInvoice.customer.legalName}
                  </p>
                  <p className="font-mono font-bold text-emerald-800 text-xs mt-0.5">
                    CIF / NIF: {monthlyInvoice.customer.cifNif}
                  </p>
                </div>
                <div className="text-end text-[11px] text-gray-600">
                  <p>Dirección: {monthlyInvoice.customer.address}</p>
                  <p>
                    {monthlyInvoice.customer.postalCode} — {monthlyInvoice.customer.city} ({monthlyInvoice.customer.province})
                  </p>
                  <p>Contacto: {monthlyInvoice.customer.contactPerson} ({monthlyInvoice.customer.phone})</p>
                </div>
              </div>
            </div>

            {/* Line Items Table (Matches Spanish Cash & Carry layout) */}
            <div className="my-4">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="border-y-2 border-gray-400 bg-gray-100 font-bold text-gray-800 text-[10px] uppercase">
                    <th className="py-2 ps-2 text-start">{t("code")}</th>
                    <th className="py-2 text-start">{t("itemDescription")}</th>
                    <th className="py-2 text-center">{t("boxes")}</th>
                    <th className="py-2 text-center">{t("units")}</th>
                    <th className="py-2 text-center">{t("vatRate")}</th>
                    <th className="py-2 text-end">{t("priceExVat")}</th>
                    <th className="py-2 text-end">{t("priceIncVat")}</th>
                    <th className="py-2 pe-2 text-end">{t("total")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monthlyInvoice.itemizedSummary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-1.5 ps-2 font-mono text-[10px] text-gray-600">
                        {item.code}
                      </td>
                      <td className="py-1.5 font-semibold text-gray-900">
                        {item.name}
                      </td>
                      <td className="py-1.5 text-center font-bold text-gray-700">
                        {Math.max(1, Math.round(item.totalQuantity / 12))}
                      </td>
                      <td className="py-1.5 text-center font-bold text-emerald-800">
                        {item.totalQuantity}
                      </td>
                      <td className="py-1.5 text-center font-mono">
                        {item.ivaRate}%
                      </td>
                      <td className="py-1.5 text-end font-mono text-gray-600">
                        €{item.priceWithoutIva.toFixed(3)}
                      </td>
                      <td className="py-1.5 text-end font-mono text-gray-700">
                        €{item.priceWithIva.toFixed(3)}
                      </td>
                      <td className="py-1.5 pe-2 text-end font-mono font-bold text-gray-900">
                        €{item.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary: Due Date, IVA Taxes Table & Grand Total */}
            <div className="mt-6 border-t-2 border-gray-400 pt-4 space-y-3">
              {/* Due Date & Condition */}
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-lg px-4 py-2 text-xs">
                <div>
                  <span className="font-bold text-emerald-900">{t("dueDate")}: </span>
                  <span className="font-mono font-bold text-emerald-800">
                    {monthlyInvoice.dueDate}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-emerald-900">{t("paymentTerms")}: </span>
                  <span className="font-extrabold text-emerald-700 uppercase">
                    {monthlyInvoice.paymentTerms}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">IBAN: </span>
                  <span className="font-mono font-bold text-gray-900">
                    {SUPERBARRIO_FISCAL_DATA.iban}
                  </span>
                </div>
              </div>

              {/* Spanish Legal IVA Table + Total Factura */}
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* Cuadro de Impuestos (IVA Table) */}
                <div className="col-span-8 border border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full text-center text-[10px]">
                    <thead className="bg-gray-100 border-b border-gray-300 font-bold uppercase text-gray-700">
                      <tr>
                        <th className="py-1">{t("vatRate")}</th>
                        <th className="py-1">{t("taxBase")}</th>
                        <th className="py-1">{t("taxQuota")}</th>
                        <th className="py-1">{t("total")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {monthlyInvoice.ivaBreakdown.map((row) => (
                        <tr key={row.rate}>
                          <td className="py-1 font-bold">{row.rate}%</td>
                          <td className="py-1 font-mono">€{row.base.toFixed(2)}</td>
                          <td className="py-1 font-mono">€{row.cuota.toFixed(2)}</td>
                          <td className="py-1 font-mono font-bold">
                            €{(row.base + row.cuota).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-gray-300">
                        <td className="py-1">{t("totals")}</td>
                        <td className="py-1 font-mono text-emerald-900">
                          €{monthlyInvoice.totalBaseImponible.toFixed(2)}
                        </td>
                        <td className="py-1 font-mono text-emerald-900">
                          €{monthlyInvoice.totalCuotaIva.toFixed(2)}
                        </td>
                        <td className="py-1 font-mono text-emerald-900">
                          €{monthlyInvoice.totalPurchases.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Grand Total Box (TOTAL FACTURA) */}
                <div className="col-span-4 border-2 border-emerald-700 rounded-xl p-3 bg-gradient-to-br from-emerald-50 to-white text-end">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    {t("totalInvoice")}
                  </span>
                  <span className="font-mono text-2xl font-black text-emerald-900 block my-1">
                    €{monthlyInvoice.closingBalance.toFixed(2)}
                  </span>
                  <span className="block text-[9px] text-gray-500 italic">
                    {t("taxesIncluded")}
                  </span>
                </div>
              </div>

              {/* Legal Notice & Signature Line */}
              <div className="mt-4 pt-3 border-t border-gray-200 flex items-end justify-between text-[10px] text-gray-500">
                <div className="max-w-md">
                  <p className="font-bold text-gray-700">
                    {t("legalNoticeTitle")}
                  </p>
                  <p className="leading-tight mt-0.5">
                    {t("legalNoticeText")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-10 border-b border-gray-400 w-44 mb-1"></div>
                  <span className="font-bold text-[9px] uppercase text-gray-600">
                    {t("recipientSignature")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. TAB 2: DAILY DELIVERY NOTES / ALBARANES LIST ── */}
      {activeTab === "ledger" && (
        <div className="no-print rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                {t("deliveryNotesTitle", {
                  client: selectedCustomer?.commercialName || "",
                })}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("deliveryNotesSubtitle")}
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              ● Saldo: €{selectedCustomer?.currentBalance.toFixed(2)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-gray-50 text-gray-600 dark:bg-gray-800/60 dark:text-gray-300 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 text-start">{t("dateAndInvoice")}</th>
                  <th className="px-4 py-3 text-start">{t("type")}</th>
                  <th className="px-4 py-3 text-start">{t("itemsDetail")}</th>
                  <th className="px-4 py-3 text-end">{t("supplyDebit")}</th>
                  <th className="px-4 py-3 text-end">{t("paymentCredit")}</th>
                  <th className="px-4 py-3 text-end">{t("pendingBalance")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedLedger.map((entry) => {
                  const isPurchase = entry.type === "purchase";
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="block font-semibold text-gray-900 dark:text-white">
                          {new Date(entry.date).toLocaleDateString("es-ES")}
                        </span>
                        {entry.facturaNumber && (
                          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded">
                            {entry.facturaNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isPurchase ? (
                          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-800">
                            {t("supplyBadge")}
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            {t("paymentReceivedBadge")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-gray-900 dark:text-white block">
                          {entry.description}
                        </span>
                        {entry.items && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.items.map((it, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              >
                                <strong>{it.quantity}x</strong> {it.name} (€{it.total.toFixed(2)})
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-end font-mono font-bold text-orange-600">
                        {entry.debit > 0 ? `+€${entry.debit.toFixed(2)}` : "-"}
                      </td>
                      <td className="px-4 py-3.5 text-end font-mono font-bold text-emerald-600">
                        {entry.credit > 0 ? `-€${entry.credit.toFixed(2)}` : "-"}
                      </td>
                      <td className="px-4 py-3.5 text-end font-mono font-black text-gray-900 dark:text-white">
                        €{entry.balance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Ledger Pagination */}
          <Pagination
            currentPage={ledgerPage}
            totalPages={ledgerTotalPages}
            totalItems={customerLedger.length}
            itemsPerPage={ledgerItemsPerPage}
            onPageChange={(p) => setLedgerPage(p)}
          />
        </div>
      )}

      {/* ── 6. RECORD PAYMENT MODAL ── */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 text-gray-900 dark:text-white">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <DollarLineIcon className="h-5 w-5 text-emerald-600" />
              <span>
                {t("modalPaymentTitle", {
                  client: selectedCustomer.commercialName,
                })}
              </span>
            </h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {t("amountReceived")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 500.00"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  {t("paymentMethod")}
                </label>
                <CustomSelect
                  options={[
                    { value: "bank_transfer", label: t("bankTransfer") },
                    { value: "cash", label: t("cash") },
                    { value: "bizum", label: t("bizum") },
                    { value: "card", label: t("card") },
                  ]}
                  value={paymentMode || "bank_transfer"}
                  onChange={(val) =>
                    setPaymentMode(val as KhataEntry["paymentMode"])
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white"
                >
                  {t("savePayment")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. RECORD NEW SUPPLY DELIVERY MODAL ── */}
      {isPurchaseModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 text-gray-900 dark:text-white">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <BoxCubeIcon className="h-5 w-5 text-gray-700" />
              <span>
                {t("modalSupplyTitle", {
                  client: selectedCustomer.commercialName,
                })}
              </span>
            </h3>
            <form onSubmit={handleRecordPurchase} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">
                  {t("itemName")}
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 dark:bg-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">{t("boxesCount")}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={boxes}
                    onChange={(e) => setBoxes(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-1.5 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{t("unitsPerBox")}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={unitsPerBox}
                    onChange={(e) => setUnitsPerBox(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-1.5 dark:bg-gray-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">{t("unitPrice")}</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-1.5 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{t("vatType")}</label>
                  <CustomSelect
                    options={[
                      { value: "21", label: t("vat21") },
                      { value: "10", label: t("vat10") },
                      { value: "4", label: t("vat4") },
                    ]}
                    value={String(ivaRate)}
                    onChange={(val) =>
                      setIvaRate(parseInt(val) as 4 | 10 | 21)
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gray-900 px-5 py-2 text-white font-bold"
                >
                  {t("addToDelivery")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
