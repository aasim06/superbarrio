"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { KhataCustomer, MonthlyKhataInvoice } from "@/types/khata";
import {
  getKhataCustomers,
  getCustomerKhataLedger,
  generateMonthlyInvoice,
  generateWhatsAppBillText,
  SUPERBARRIO_FISCAL_DATA,
} from "@/data/khataStore";
import {
  DocsIcon,
  WhatsAppIcon,
  DownloadIcon,
  CopyIcon,
  LeafIcon,
} from "@/icons";
import Select from "@/components/form/Select";

export default function KhataInvoicesView() {
  const searchParams = useSearchParams();
  const initialClientId = searchParams?.get("clientId") || "";

  const [customers, setCustomers] = useState<KhataCustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialClientId);
  const [copySuccess, setCopySuccess] = useState(false);

  const reloadData = () => {
    const list = getKhataCustomers();
    setCustomers(list);
    if (!selectedCustomerId && list.length > 0) {
      setSelectedCustomerId(list[0].id);
    }
  };

  useEffect(() => {
    reloadData();
    window.addEventListener("khata-data-updated", reloadData);
    return () => window.removeEventListener("khata-data-updated", reloadData);
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) || customers[0],
    [customers, selectedCustomerId],
  );

  const monthlyInvoice = useMemo(() => {
    if (!selectedCustomer) return null;
    return generateMonthlyInvoice(selectedCustomer.id, "November 2026", 10, 2026);
  }, [selectedCustomer]);

  const handleSendWhatsApp = () => {
    if (!monthlyInvoice) return;
    const text = generateWhatsAppBillText(monthlyInvoice);
    const cleanPhone = monthlyInvoice.customer.phone.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyBill = () => {
    if (!monthlyInvoice) return;
    const text = generateWhatsAppBillText(monthlyInvoice);
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const customerSelectOptions = useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label: `${c.commercialName} (Balance: €${c.currentBalance.toFixed(2)})`,
    }));
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* ── Print Styling for Official Factura ── */}
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
                <DocsIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide font-outfit uppercase">
                  Monthly Invoices & Billing
                </h1>
                <p className="text-xs text-emerald-400 font-medium">
                  Official Spanish Commercial Invoices for Hospitality Clients
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 max-w-xl">
              Consolidated monthly tax invoices, 1-click WhatsApp billing statements, and printable official A4 tax invoices.
            </p>
          </div>

          {selectedCustomer && (
            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-md">
              <span className="block text-[11px] text-gray-400">Total Invoice Due</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                €{monthlyInvoice?.closingBalance != null ? monthlyInvoice.closingBalance.toFixed(2) : "0.00"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Client Selection & Toolbar with Custom Select ── */}
      <div className="no-print flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3 w-full max-w-md">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Select Client:
          </label>
          <div className="w-full">
            <Select
              options={customerSelectOptions}
              value={selectedCustomer?.id || ""}
              onChange={setSelectedCustomerId}
              placeholder="Select Client Account"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#20ba59] active:scale-95 transition-all"
          >
            <WhatsAppIcon className="h-4 w-4 fill-current" />
            <span>Send WhatsApp Bill</span>
          </button>

          <button
            onClick={handleCopyBill}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-all"
          >
            <CopyIcon className="h-4 w-4" />
            <span>{copySuccess ? "Copied" : "Copy Summary"}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-black dark:bg-gray-800 active:scale-95 transition-all"
          >
            <DownloadIcon className="h-4 w-4" />
            <span>Print Invoice (A4)</span>
          </button>
        </div>
      </div>

      {/* ── 3. Official Factura Layout ── */}
      {monthlyInvoice && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div
            id="official-spanish-factura"
            className="max-w-4xl mx-auto border-2 border-gray-200 rounded-2xl p-6 sm:p-8 bg-white text-gray-900"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-6 border-b-2 border-emerald-800">
              <div>
                <div className="flex items-center gap-2">
                  <LeafIcon className="h-6 w-6 text-emerald-700" />
                  <h1 className="text-xl font-black font-outfit uppercase tracking-wider text-emerald-950">
                    {SUPERBARRIO_FISCAL_DATA.companyName}
                  </h1>
                </div>
                <div className="mt-2 text-[11px] text-gray-600 leading-tight space-y-0.5">
                  <p><strong>CIF:</strong> {SUPERBARRIO_FISCAL_DATA.cif}</p>
                  <p>{SUPERBARRIO_FISCAL_DATA.address}, {SUPERBARRIO_FISCAL_DATA.postalCode} {SUPERBARRIO_FISCAL_DATA.city}</p>
                  <p>Tel: {SUPERBARRIO_FISCAL_DATA.phone} • Email: {SUPERBARRIO_FISCAL_DATA.email}</p>
                  <p className="font-mono text-[10px] text-gray-500">{SUPERBARRIO_FISCAL_DATA.registroMercantil}</p>
                </div>
              </div>

              <div className="text-end">
                <div className="inline-block border-2 border-emerald-800 rounded-xl px-4 py-2 bg-emerald-50/50">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-900">
                    OFFICIAL INVOICE
                  </span>
                  <span className="font-mono text-base font-black text-emerald-950 block">
                    {monthlyInvoice.invoiceNumber}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-gray-600 space-y-0.5">
                  <p>Issue Date: <strong>{monthlyInvoice.issueDate}</strong></p>
                  <p>Due Date: <strong>{monthlyInvoice.dueDate}</strong></p>
                  <p className="text-purple-700 font-bold">Terms: {monthlyInvoice.customer.creditDays} Days Credit</p>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="my-6 rounded-xl bg-gray-50 border border-gray-200 p-4 text-xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Client / Commercial Account Details:
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-black text-gray-900">
                    {monthlyInvoice.customer.commercialName}
                  </p>
                  <p className="text-gray-600">
                    Legal Name: {monthlyInvoice.customer.legalName}
                  </p>
                  <p className="font-mono text-gray-700">
                    Tax ID (CIF/NIF): {monthlyInvoice.customer.cifNif}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    {monthlyInvoice.customer.address}, {monthlyInvoice.customer.postalCode} {monthlyInvoice.customer.city}
                  </p>
                  <p className="text-gray-600">
                    Chef / Contact: <strong>{monthlyInvoice.customer.contactPerson}</strong>
                  </p>
                  <p className="text-gray-600">
                    Phone: {monthlyInvoice.customer.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-start text-xs border border-gray-200 my-4">
              <thead className="bg-gray-100 font-bold text-gray-700 text-[11px] uppercase">
                <tr>
                  <th className="px-3 py-2 text-start border-b">Description / Article</th>
                  <th className="px-3 py-2 text-center border-b">Units / Boxes</th>
                  <th className="px-3 py-2 text-end border-b">Tax Base</th>
                  <th className="px-3 py-2 text-center border-b">VAT %</th>
                  <th className="px-3 py-2 text-end border-b">VAT Amount</th>
                  <th className="px-3 py-2 text-end border-b">Total (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyInvoice.itemizedSummary && monthlyInvoice.itemizedSummary.length > 0 ? (
                  monthlyInvoice.itemizedSummary.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium">
                        <span>{it.name}</span>
                        {it.code && <span className="block font-mono text-[10px] text-gray-400">Ref: {it.code}</span>}
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-gray-800">
                        {it.totalQuantity} {it.unit}
                      </td>
                      <td className="px-3 py-2 text-end font-mono">
                        €{(it.priceWithoutIva * it.totalQuantity).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center font-mono">
                        {it.ivaRate}%
                      </td>
                      <td className="px-3 py-2 text-end font-mono">
                        €{(it.totalAmount - it.priceWithoutIva * it.totalQuantity).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-end font-mono font-bold">
                        €{it.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      No supplies recorded during this billing period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Tax Breakdown & Total */}
            <div className="grid grid-cols-12 gap-4 mt-6 pt-4 border-t-2 border-gray-200">
              <div className="col-span-8">
                <span className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                  Tax Breakdown (Spanish VAT / IVA):
                </span>
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="text-gray-500 border-b text-[10px]">
                      <th className="pb-1 text-start">VAT Rate</th>
                      <th className="pb-1 text-end">Tax Base</th>
                      <th className="pb-1 text-end">VAT Quota</th>
                      <th className="pb-1 text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyInvoice.ivaBreakdown?.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100 font-mono text-[11px]">
                        <td className="py-1">{row.rate}%</td>
                        <td className="py-1 text-end">€{(row.base ?? 0).toFixed(2)}</td>
                        <td className="py-1 text-end">€{(row.cuota ?? 0).toFixed(2)}</td>
                        <td className="py-1 text-end font-bold">€{((row.base ?? 0) + (row.cuota ?? 0)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Bank Account */}
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-900">
                  <span className="block text-[10px] font-bold uppercase">Bank Settlement Details (Wire Transfer):</span>
                  <p className="font-mono font-bold text-xs mt-0.5">IBAN: {SUPERBARRIO_FISCAL_DATA.iban}</p>
                  <p className="text-[11px] text-gray-600">Beneficiary: {SUPERBARRIO_FISCAL_DATA.companyName}</p>
                </div>
              </div>

              {/* Grand Total Box */}
              <div className="col-span-4 border-2 border-emerald-700 rounded-2xl p-4 bg-emerald-50/60 text-end flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] font-black uppercase text-emerald-800">
                    TOTAL INVOICE
                  </span>
                  <span className="font-mono text-3xl font-black text-emerald-950 block my-2">
                    €{monthlyInvoice.closingBalance != null ? monthlyInvoice.closingBalance.toFixed(2) : "0.00"}
                  </span>
                  <span className="block text-[10px] text-gray-500 italic">
                    All applicable taxes included
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-end justify-between text-[10px] text-gray-500">
              <p className="max-w-md">
                Official commercial invoice issued in accordance with Spanish Royal Decree 1619/2012. Valid for corporate tax deduction.
              </p>
              <div className="text-center">
                <div className="h-10 border-b border-gray-400 w-48 mb-1"></div>
                <span className="font-bold text-[9px] uppercase text-gray-600">
                  Authorized Client Signature
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}