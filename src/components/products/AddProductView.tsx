"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { ProductCard } from "@/components/grocery/ProductCard";
import {
  GROCERY_CATEGORIES,
  saveProduct,
  saveBulkProducts,
  getCustomProducts,
  deleteProduct,
} from "@/data/groceryData";
import { GroceryProduct } from "@/types/grocery";
import {
  PlusIcon,
  TrashBinIcon,
  UploadIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  LeafIcon,
  CloseIcon,
  PencilIcon,
  DownloadIcon,
  SearchIcon,
  RefreshIcon,
  FileIcon,
} from "@/icons";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { formatPrice } from "@/utils/currency";

const PRESET_IMAGES = [
  {
    name: "Red Fuji Apples",
    category: "fruits-vegetables",
    url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Hass Avocados",
    category: "fruits-vegetables",
    url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Artisan Sourdough",
    category: "bakery",
    url: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Farm Fresh Milk",
    category: "dairy-eggs",
    url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Pure Natural Honey",
    category: "pantry-cooking",
    url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Cold Brew Coffee",
    category: "beverages",
    url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80",
  },
];

const UNIT_PRESETS = [
  "1 kg",
  "500g",
  "250g",
  "1 Dozen",
  "Pack of 4",
  "1 Liter",
  "500 ml",
  "1 Piece",
];

export default function AddProductView() {
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Mode tracking
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("Organic Fuji Apples");
  const [sku, setSku] = useState("SB-APL-101");
  const [price, setPrice] = useState("3.49");
  const [originalPrice, setOriginalPrice] = useState("4.20");
  const [costPrice, setCostPrice] = useState("2.10");
  const [unit, setUnit] = useState("1 kg");
  const [category, setCategory] = useState("fruits-vegetables");
  const [stockQuantity, setStockQuantity] = useState("45");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [expiryDate, setExpiryDate] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80"
  );
  const [badge, setBadge] = useState("Fresh");
  const [origin, setOrigin] = useState("Local Orchard");
  const [description, setDescription] = useState(
    "Crisp, sweet organic Fuji apples freshly harvested and delivered directly from the farm."
  );

  // Feedback, List & Search State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customProducts, setCustomProducts] = useState<GroceryProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Category select options
  const categoryOptions = GROCERY_CATEGORIES.filter((c) => c.id !== "all").map(
    (c) => ({
      value: c.id,
      label: c.name,
    })
  );

  // Load custom products on mount
  useEffect(() => {
    setCustomProducts(getCustomProducts());
  }, []);

  // Profit Margin calculation
  const saleNum = parseFloat(price) || 0;
  const costNum = parseFloat(costPrice) || 0;
  const origNum = parseFloat(originalPrice) || 0;
  const profitPerUnit = saleNum - costNum;
  const profitMarginPercent =
    saleNum > 0 ? ((profitPerUnit / saleNum) * 100).toFixed(1) : "0.0";

  // Discount % calculation
  const discountPercent =
    origNum > saleNum && origNum > 0
      ? Math.round(((origNum - saleNum) / origNum) * 100)
      : null;

  // Stock status calculation
  const stockNum = parseInt(stockQuantity, 10) || 0;
  const lowStockNum = parseInt(lowStockThreshold, 10) || 10;
  const isOutOfStock = stockNum <= 0;
  const isLowStock = stockNum > 0 && stockNum <= lowStockNum;

  // Generate random SKU
  const handleGenerateSku = () => {
    const prefix = category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setSku(`SB-${prefix}-${randomNum}`);
  };

  // Handle local image file upload (Base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Construct live preview product object
  const previewProduct: GroceryProduct = useMemo(
    () => ({
      id: editingId || "preview-temp",
      name: name.trim() || "Product Title Preview",
      category,
      price: saleNum,
      originalPrice: origNum > 0 ? origNum : undefined,
      costPrice: costNum > 0 ? costNum : undefined,
      unit: unit.trim() || "1 item",
      rating: 4.9,
      reviewsCount: 38,
      inStock: !isOutOfStock,
      stockQuantity: stockNum,
      lowStockThreshold: lowStockNum,
      sku: sku.trim() || undefined,
      expiryDate: expiryDate || undefined,
      badge: badge.trim() || undefined,
      emoji: "",
      imageUrl: imageUrl.trim() || "",
      description: description || "Fresh supermarket item description preview.",
      origin: origin.trim() || "SuperBarrio",
    }),
    [
      editingId,
      name,
      category,
      saleNum,
      origNum,
      costNum,
      unit,
      isOutOfStock,
      stockNum,
      lowStockNum,
      sku,
      expiryDate,
      badge,
      imageUrl,
      description,
      origin,
    ]
  );

  // Form Submit (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const productId = editingId || `prod-${Date.now()}`;

    const productData: GroceryProduct = {
      id: productId,
      name: name.trim(),
      category,
      price: saleNum,
      originalPrice: origNum > 0 ? origNum : undefined,
      costPrice: costNum > 0 ? costNum : undefined,
      unit: unit.trim() || "1 item",
      rating: 5.0,
      reviewsCount: 1,
      inStock: !isOutOfStock,
      stockQuantity: stockNum,
      lowStockThreshold: lowStockNum,
      sku: sku.trim() || undefined,
      expiryDate: expiryDate || undefined,
      badge: badge.trim() || undefined,
      emoji: "",
      imageUrl: imageUrl.trim(),
      description: description.trim(),
      origin: origin.trim() || "SuperBarrio",
    };

    saveProduct(productData);
    setCustomProducts(getCustomProducts());

    setToastMessage(
      editingId
        ? `Product "${productData.name}" updated successfully!`
        : `Product "${productData.name}" published successfully!`
    );
    setTimeout(() => setToastMessage(null), 4500);

    // Reset Form
    handleClear();
  };

  // Populate Form for Editing
  const handleEdit = (product: GroceryProduct) => {
    setEditingId(product.id);
    setName(product.name);
    setSku(product.sku || "");
    setPrice(product.price.toString());
    setOriginalPrice(
      product.originalPrice ? product.originalPrice.toString() : ""
    );
    setCostPrice(product.costPrice ? product.costPrice.toString() : "");
    setUnit(product.unit);
    setCategory(product.category);
    setStockQuantity(
      product.stockQuantity !== undefined ? product.stockQuantity.toString() : "50"
    );
    setLowStockThreshold(
      product.lowStockThreshold !== undefined
        ? product.lowStockThreshold.toString()
        : "10"
    );
    setExpiryDate(product.expiryDate || "");
    setImageUrl(product.imageUrl || "");
    setBadge(product.badge || "");
    setOrigin(product.origin || "");
    setDescription(product.description || "");

    // Scroll to form smoothly
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Clear or Cancel Edit Form
  const handleClear = () => {
    setEditingId(null);
    setName("");
    setSku("");
    setPrice("");
    setOriginalPrice("");
    setCostPrice("");
    setUnit("1 kg");
    setStockQuantity("50");
    setLowStockThreshold("10");
    setExpiryDate("");
    setDescription("");
    setImageUrl("");
    setBadge("");
    setOrigin("");
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    if (editingId === id) {
      handleClear();
    }
    deleteProduct(id);
    setCustomProducts(getCustomProducts());
  };

  // Export Custom Products to CSV
  const handleExportCSV = () => {
    const listToExport =
      customProducts.length > 0 ? customProducts : [previewProduct];
    const headers = [
      "name",
      "category",
      "price",
      "originalPrice",
      "costPrice",
      "unit",
      "stockQuantity",
      "sku",
      "expiryDate",
      "badge",
      "origin",
      "imageUrl",
      "description",
    ];

    const rows = listToExport.map((p) => [
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${p.category || ""}"`,
      p.price || 0,
      p.originalPrice || "",
      p.costPrice || "",
      `"${p.unit || ""}"`,
      p.stockQuantity ?? 50,
      `"${p.sku || ""}"`,
      `"${p.expiryDate || ""}"`,
      `"${p.badge || ""}"`,
      `"${p.origin || ""}"`,
      `"${p.imageUrl || ""}"`,
      `"${(p.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `superbarrio_products_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample CSV Template
  const handleDownloadSampleTemplate = () => {
    const headers = [
      "name",
      "category",
      "price",
      "originalPrice",
      "costPrice",
      "unit",
      "stockQuantity",
      "sku",
      "expiryDate",
      "badge",
      "origin",
      "imageUrl",
      "description",
    ];

    const sampleRows = [
      [
        '"Organic Gala Apples"',
        '"fruits-vegetables"',
        "3.20",
        "3.80",
        "2.00",
        '"1 kg"',
        "60",
        '"SB-FRU-2001"',
        '"2026-12-15"',
        '"Fresh"',
        '"Green Orchards"',
        '"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80"',
        '"Crisp sweet organic fresh apples directly harvested."',
      ],
      [
        '"Whole Almond Milk"',
        '"dairy-eggs"',
        "2.99",
        "3.50",
        "1.80",
        '"1 Liter"',
        "40",
        '"SB-DAI-3002"',
        '"2026-11-30"',
        '"Vegan"',
        '"Nature Pure"',
        '"https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80"',
        '"Plant based dairy free fresh organic almond beverage."',
      ],
      [
        '"French Artisan Baguette"',
        '"bakery"',
        "2.49",
        "2.90",
        "1.20",
        '"1 Piece"',
        "25",
        '"SB-BAK-4003"',
        '"2026-11-10"',
        '"Hot Daily"',
        '"BakeHouse"',
        '"https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop&q=80"',
        '"Traditional crispy golden crust sourdough baguette."',
      ],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...sampleRows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sample_products_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV File
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          alert("CSV file is empty or missing headers.");
          return;
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());

        const importedProducts: GroceryProduct[] = [];

        for (let i = 1; i < lines.length; i++) {
          // Parse CSV line taking quotes into account
          const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
          const values: string[] = [];
          let match;
          while ((match = regex.exec(lines[i])) !== null) {
            let val = match[1];
            if (val === undefined) continue;
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.substring(1, val.length - 1).replace(/""/g, '"');
            }
            values.push(val.trim());
            if (regex.lastIndex >= lines[i].length) break;
          }

          if (values.length < 2) continue;

          const rowData: Record<string, string> = {};
          headers.forEach((h, index) => {
            rowData[h] = values[index] || "";
          });

          const prodName = rowData["name"] || rowData["title"] || `Imported Item ${i}`;
          const prodPrice = parseFloat(rowData["price"]) || 1.99;
          const prodOrigPrice = rowData["originalprice"]
            ? parseFloat(rowData["originalprice"])
            : undefined;
          const prodCostPrice = rowData["costprice"]
            ? parseFloat(rowData["costprice"])
            : undefined;
          const prodCategory = rowData["category"] || "fruits-vegetables";
          const prodUnit = rowData["unit"] || "1 item";
          const prodStock = parseInt(rowData["stockquantity"] || rowData["stock"] || "50", 10);
          const prodSku = rowData["sku"] || `SB-IMP-${Date.now().toString().slice(-4)}${i}`;
          const prodExpiry = rowData["expirydate"] || undefined;
          const prodBadge = rowData["badge"] || undefined;
          const prodOrigin = rowData["origin"] || "SuperBarrio";
          const prodImage = rowData["imageurl"] || rowData["image"] || "";
          const prodDesc =
            rowData["description"] || "Imported grocery supermarket item.";

          importedProducts.push({
            id: `prod-csv-${Date.now()}-${i}`,
            name: prodName,
            category: prodCategory,
            price: prodPrice,
            originalPrice: prodOrigPrice,
            costPrice: prodCostPrice,
            unit: prodUnit,
            rating: 5.0,
            reviewsCount: 1,
            inStock: prodStock > 0,
            stockQuantity: prodStock,
            lowStockThreshold: 10,
            sku: prodSku,
            expiryDate: prodExpiry,
            badge: prodBadge,
            emoji: "",
            imageUrl: prodImage,
            description: prodDesc,
            origin: prodOrigin,
          });
        }

        if (importedProducts.length > 0) {
          saveBulkProducts(importedProducts);
          setCustomProducts(getCustomProducts());
          setToastMessage(
            `Successfully imported ${importedProducts.length} products from CSV!`
          );
          setTimeout(() => setToastMessage(null), 5000);
        } else {
          alert("Could not parse products from this CSV. Check formatting.");
        }
      } catch (err) {
        console.error("CSV import error:", err);
        alert("Error parsing CSV file.");
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (e.target) e.target.value = "";
  };

  // Filter products by search query
  const filteredCustomProducts = customProducts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 end-6 z-99999 flex items-center gap-3.5 rounded-2xl border border-success-500/30 bg-white p-4 text-gray-800 shadow-theme-xl backdrop-blur-md dark:border-success-500/30 dark:bg-gray-900 dark:text-white">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-sm font-semibold">{toastMessage}</h5>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Changes are live on the SuperBarrio Storefront.
            </p>
          </div>
          <Link href="/grocery" className="ms-2">
            <Button size="sm" variant="primary">
              View Storefront
            </Button>
          </Link>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Form inside ComponentCard */}
        <div className="col-span-12 xl:col-span-7">
          <ComponentCard
            title={editingId ? "Edit Product Card" : "Product Information"}
            desc={
              editingId
                ? `Updating details for product ID: ${editingId}`
                : "Fill in the details below to generate and publish a new product card."
            }
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Editing Banner */}
              {editingId && (
                <div className="flex items-center justify-between rounded-xl border border-brand-500/30 bg-brand-50/60 p-3.5 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <div className="flex items-center gap-2">
                    <PencilIcon className="h-4 w-4" />
                    <span>
                      You are editing <strong>{name || "this product"}</strong>. Click
                      &quot;Update Product Card&quot; to save changes.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="font-bold underline hover:text-brand-900 dark:hover:text-white"
                  >
                    Cancel Edit
                  </button>
                </div>
              )}

              {/* 1. Title & SKU Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Label htmlFor="prod-title">
                    Product Title / Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="prod-title"
                    type="text"
                    required
                    placeholder="e.g. Organic Fuji Apples"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* SKU with Auto-Generate */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prod-sku">SKU / Barcode</Label>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="text-[11px] font-medium text-brand-500 hover:underline dark:text-brand-400"
                    >
                      Generate
                    </button>
                  </div>
                  <Input
                    id="prod-sku"
                    type="text"
                    placeholder="e.g. SB-APL-101"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>

              {/* 2. Pricing & Profit Margin Calculator */}
              <div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Sale Price */}
                  <div>
                    <Label htmlFor="prod-price">
                      Sale Price ($) <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="prod-price"
                      type="number"
                      step={0.01}
                      min={0.01}
                      required
                      placeholder="3.49"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  {/* Original / Strike-through Price */}
                  <div>
                    <Label htmlFor="prod-orig-price">
                      Original Price ($){" "}
                      <span className="text-xs font-normal text-gray-400">
                        (Discount)
                      </span>
                    </Label>
                    <Input
                      id="prod-orig-price"
                      type="number"
                      step={0.01}
                      min={0}
                      placeholder="4.20"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                    />
                  </div>

                  {/* Cost Price */}
                  <div>
                    <Label htmlFor="prod-cost-price">
                      Cost Price ($){" "}
                      <span className="text-xs font-normal text-gray-400">
                        (Wholesale)
                      </span>
                    </Label>
                    <Input
                      id="prod-cost-price"
                      type="number"
                      step={0.01}
                      min={0}
                      placeholder="2.10"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Live Profit Margin & Auto Discount Suggestion Bar */}
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2 text-xs dark:border-gray-800 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400">
                      Calculated Margin:
                    </span>
                    <span
                      className={`font-semibold ${
                        profitPerUnit >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-error-500"
                      }`}
                    >
                      {profitPerUnit >= 0 ? "+" : ""}
                      {formatPrice(profitPerUnit, locale)} ({profitMarginPercent}%)
                    </span>
                  </div>

                  {discountPercent && discountPercent > 0 && (
                    <button
                      type="button"
                      onClick={() => setBadge(`${discountPercent}% OFF`)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      <span>💡 Apply badge:</span>
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                        {discountPercent}% OFF
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Inventory & Expiry Date Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                {/* Stock Quantity */}
                <div>
                  <Label htmlFor="prod-stock">
                    Stock Units <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="prod-stock"
                    type="number"
                    min={0}
                    required
                    placeholder="45"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                  />
                </div>

                {/* Low Stock Warning Threshold */}
                <div>
                  <Label htmlFor="prod-threshold">
                    Low Stock Limit{" "}
                    <span className="text-xs font-normal text-gray-400">(Alert)</span>
                  </Label>
                  <Input
                    id="prod-threshold"
                    type="number"
                    min={1}
                    placeholder="10"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                </div>

                {/* Unit / Measurement */}
                <div>
                  <Label htmlFor="prod-unit">
                    Unit / Size <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="prod-unit"
                    type="text"
                    required
                    placeholder="e.g. 1 kg"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <Label htmlFor="prod-expiry">
                    Expiry Date{" "}
                    <span className="text-xs font-normal text-gray-400">
                      (Freshness)
                    </span>
                  </Label>
                  <Input
                    id="prod-expiry"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Quick Unit Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 me-1">
                  Unit Presets:
                </span>
                {UNIT_PRESETS.map((u) => {
                  const isSelected = unit === u;
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        isSelected
                          ? "bg-brand-500 text-white shadow-theme-xs"
                          : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:border-gray-700"
                      }`}
                    >
                      {u}
                    </button>
                  );
                })}
              </div>

              {/* 4. Category & Origin */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="prod-cat">
                    Category / Department{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    options={categoryOptions}
                    defaultValue={category}
                    value={category}
                    onChange={(val) => setCategory(val)}
                  />
                </div>

                <div>
                  <Label htmlFor="prod-origin">
                    Product Origin / Farm{" "}
                    <span className="text-xs font-normal text-gray-400">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="prod-origin"
                    type="text"
                    placeholder="e.g. Local Orchard"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
              </div>

              {/* 5. Product Image Upload & Library */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <Label className="mb-0">
                    Product Image <span className="text-error-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    <UploadIcon className="h-4 w-4" />
                    <span>Upload from Device</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Direct Image URL input */}
                <div className="mt-3">
                  <Input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                {/* Preset image thumbnails */}
                <div className="mt-3.5">
                  <span className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    Or pick from sample grocery catalog:
                  </span>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {PRESET_IMAGES.map((img) => {
                      const isSelected = imageUrl === img.url;
                      return (
                        <button
                          key={img.name}
                          type="button"
                          onClick={() => {
                            setImageUrl(img.url);
                            setName(img.name);
                            setCategory(img.category);
                          }}
                          className={`group relative flex flex-col items-center overflow-hidden rounded-xl border p-1 transition ${
                            isSelected
                              ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 dark:border-brand-500 dark:bg-brand-500/10"
                              : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                          }`}
                          title={img.name}
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                            <img
                              src={img.url}
                              alt={img.name}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                          </div>
                          <span className="mt-1 line-clamp-1 w-full text-center text-[10px] font-medium text-gray-700 dark:text-gray-300">
                            {img.name.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Image indicator */}
                {imageUrl && (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    <span className="line-clamp-1 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                      Active: {imageUrl.substring(0, 48)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="text-gray-400 hover:text-error-500"
                      title="Clear image"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Badge Tag */}
              <div>
                <Label htmlFor="prod-badge">
                  Card Badge Tag{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (Optional, e.g. Fresh, Organic, 20% OFF)
                  </span>
                </Label>
                <Input
                  id="prod-badge"
                  type="text"
                  placeholder="e.g. Fresh, Organic, 20% OFF"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                />
              </div>

              {/* 7. Description */}
              <div>
                <Label htmlFor="prod-desc">
                  Product Description{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (Optional)
                  </span>
                </Label>
                <TextArea
                  placeholder="Describe the product taste, freshness, nutrition, origin..."
                  value={description}
                  onChange={(val) => setDescription(val)}
                  rows={3}
                />
              </div>

              {/* 8. Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Button
                  variant="primary"
                  size="md"
                  startIcon={
                    editingId ? (
                      <RefreshIcon className="h-5 w-5" />
                    ) : (
                      <PlusIcon className="h-5 w-5" />
                    )
                  }
                >
                  {editingId ? "Update Product Card" : "Publish Product Card"}
                </Button>
                <Button variant="outline" size="md" onClick={handleClear}>
                  {editingId ? "Cancel Edit" : "Clear Form"}
                </Button>
                <Link href="/grocery" className="ms-auto">
                  <Button
                    variant="outline"
                    size="md"
                    endIcon={
                      <ArrowRightIcon className="h-4 w-4 rtl:rotate-180" />
                    }
                  >
                    Go to Storefront
                  </Button>
                </Link>
              </div>
            </form>
          </ComponentCard>
        </div>

        {/* Right Column: Live Card Preview & Custom Products List with Bulk Actions */}
        <div className="col-span-12 space-y-6 xl:col-span-5">
          {/* Live Card Preview */}
          <ComponentCard
            title="Live Card Preview"
            desc="Real-time preview of how customers will see this item on the storefront."
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Live Stock Status:
                  </span>
                  {isOutOfStock ? (
                    <Badge variant="solid" color="error" size="sm">
                      Out of Stock
                    </Badge>
                  ) : isLowStock ? (
                    <Badge variant="solid" color="warning" size="sm">
                      Low Stock ({stockNum} left)
                    </Badge>
                  ) : (
                    <Badge variant="light" color="success" size="sm">
                      In Stock ({stockNum})
                    </Badge>
                  )}
                </div>

                {sku && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {sku}
                  </span>
                )}
              </div>

              {/* The Actual Rendered Product Card */}
              <div className="mx-auto max-w-[320px] pt-1 pb-2">
                <ProductCard product={previewProduct} />
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3.5 text-center text-xs text-gray-500 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400">
                This card syncs directly with the customer storefront at{" "}
                <Link
                  href="/grocery"
                  className="font-medium text-brand-500 underline hover:text-brand-600 dark:text-brand-400"
                >
                  SuperBarrio Storefront
                </Link>
                .
              </div>
            </div>
          </ComponentCard>

          {/* Custom Published Products Card with Search & Bulk CSV Tools */}
          <ComponentCard
            title="Custom Inventory Products"
            desc={`${customProducts.length} custom products in local supermarket catalog.`}
          >
            <div className="space-y-4">
              {/* Toolbar: Search + Bulk Actions */}
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search by name, SKU, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pe-9 text-xs"
                  />
                  <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon className="h-4 w-4" />
                  </span>
                </div>

                {/* CSV Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Hidden File Input for CSV */}
                  <input
                    ref={csvFileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => csvFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
                    title="Import products from a CSV file"
                  >
                    <UploadIcon className="h-3.5 w-3.5" />
                    <span>Import CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
                    title="Export products list to CSV"
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Template Helper link */}
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Supports bulk SKU, pricing & images.</span>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="font-medium text-brand-500 hover:underline dark:text-brand-400"
                >
                  Download Sample CSV Template
                </button>
              </div>

              {/* Products List */}
              {filteredCustomProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400 dark:border-gray-800">
                  <p>No products match your search or filter.</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Use the form on the left or Import CSV to add products!
                  </p>
                </div>
              ) : (
                <div className="max-h-[380px] divide-y divide-gray-100 overflow-y-auto custom-scrollbar dark:divide-gray-800">
                  {filteredCustomProducts.map((p) => {
                    const isItemEditing = editingId === p.id;
                    const itemStock = p.stockQuantity ?? 50;
                    const itemLowLimit = p.lowStockThreshold ?? 10;
                    const isItemOut = itemStock <= 0;
                    const isItemLow = itemStock > 0 && itemStock <= itemLowLimit;

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between py-3 first:pt-0 last:pb-0 transition ${
                          isItemEditing ? "bg-brand-50/40 p-2 rounded-xl dark:bg-brand-500/10" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <LeafIcon className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {p.name}
                              </h5>
                              {p.sku && (
                                <span className="rounded bg-gray-100 px-1.5 py-0.2 font-mono text-[9px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                  {p.sku}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatPrice(p.price, locale)}
                              </span>
                              <span>• {p.unit}</span>
                              <span>•</span>
                              <span
                                className={`font-medium ${
                                  isItemOut
                                    ? "text-error-500"
                                    : isItemLow
                                    ? "text-warning-500"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {isItemOut
                                  ? "Out of Stock"
                                  : isItemLow
                                  ? `Low (${itemStock})`
                                  : `${itemStock} in stock`}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Action buttons: Edit & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            className={`rounded-lg p-2 transition ${
                              isItemEditing
                                ? "bg-brand-500 text-white shadow-theme-xs"
                                : "text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            }`}
                            title="Edit Product"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                            title="Delete Product"
                          >
                            <TrashBinIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
