"use client";

import React, { useState, useMemo } from "react";
import { GroceryCategory } from "@/types/grocery";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import { PlusIcon, TrashBinIcon, PencilIcon } from "@/icons";
import { toast } from "sonner";
import CustomSelect, { CustomSelectOption } from "@/components/ui/dropdown/CustomSelect";
import Pagination from "@/components/tables/Pagination";

interface CategoriesClientProps {
  initialCategories: GroceryCategory[];
}

const ICON_OPTIONS: CustomSelectOption[] = [
  {
    value: "fruits-vegetables",
    label: "Frutas y Verduras",
    sublabel: "fruits-vegetables",
  },
  {
    value: "dairy-eggs",
    label: "Lácteos y Huevos",
    sublabel: "dairy-eggs",
  },
  {
    value: "bakery",
    label: "Panadería y Panes",
    sublabel: "bakery",
  },
  {
    value: "meat-poultry",
    label: "Carnes y Aves",
    sublabel: "meat-poultry",
  },
  {
    value: "pantry-cooking",
    label: "Despensa y Especias",
    sublabel: "pantry-cooking",
  },
  {
    value: "beverages",
    label: "Bebidas y Jugos",
    sublabel: "beverages",
  },
  {
    value: "snacks",
    label: "Aperitivos y Snacks",
    sublabel: "snacks",
  },
  {
    value: "leaf",
    label: "Eco & Natural",
    sublabel: "leaf",
  },
  {
    value: "store",
    label: "Tienda / General",
    sublabel: "store",
  },
  {
    value: "cart",
    label: "Carrito / Super",
    sublabel: "cart",
  },
  {
    value: "box",
    label: "Packs / Cajas",
    sublabel: "box",
  },
];

const STATUS_OPTIONS: CustomSelectOption[] = [
  {
    value: "active",
    label: "Active (Visible)",
    sublabel: "Published on customer store",
  },
  {
    value: "inactive",
    label: "Inactive (Hidden)",
    sublabel: "Hidden from customers",
  },
];

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<GroceryCategory[]>(initialCategories);
  const [search, setSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GroceryCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<GroceryCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [nameEs, setNameEs] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [icon, setIcon] = useState("fruits-vegetables");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const filteredCategories = categories.filter((c) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      c.id.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term) ||
      (c.nameEn && c.nameEn.toLowerCase().includes(term)) ||
      c.icon.toLowerCase().includes(term)
    );
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const s = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(s, s + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCode("");
    setNameEs("");
    setNameEn("");
    setIcon("fruits-vegetables");
    setStatus("active");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: GroceryCategory) => {
    setEditingCategory(cat);
    setCode(cat.id);
    setNameEs(cat.name);
    setNameEn(cat.nameEn || "");
    setIcon(cat.icon || "fruits-vegetables");
    setStatus(cat.status || "active");
    setIsModalOpen(true);
  };

  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    // Auto-slugify only if adding a new category
    if (!editingCategory && (!code || code === nameEn.toLowerCase().replace(/[^a-z0-9]/g, "-"))) {
      const slug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setCode(slug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "-");
    const cleanNameEs = nameEs.trim();
    const cleanNameEn = nameEn.trim() || cleanNameEs;

    if (!cleanCode || cleanCode.length < 2) {
      toast.error("Category Code / ID must be at least 2 characters.");
      return;
    }

    if (!cleanNameEs || cleanNameEs.length < 2) {
      toast.error("Category Name in Spanish is required.");
      return;
    }

    const isEdit = !!editingCategory;

    // Check if ID already exists (only when creating new)
    if (!isEdit && categories.some((c) => c.id === cleanCode)) {
      toast.error(`A category with ID "${cleanCode}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cleanCode,
          name: cleanNameEs,
          nameEn: cleanNameEn,
          icon,
          status,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        if (isEdit) {
          setCategories((prev) =>
            prev.map((c) => (c.id === cleanCode ? json.data : c))
          );
          toast.success(`Category "${cleanNameEs}" updated successfully!`);
        } else {
          setCategories((prev) => [...prev, json.data]);
          toast.success(`Category "${cleanNameEs}" created successfully!`);
        }
        setIsModalOpen(false);
      } else {
        toast.error(json.error || "Failed to save category.");
      }
    } catch (err) {
      console.error("Error saving category:", err);
      toast.error("Network error while saving category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const { id, name } = categoryToDelete;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast.success(`Category "${name}" removed successfully.`);
        setCategoryToDelete(null);
      } else {
        toast.error(json.error || "Failed to delete category.");
      }
    } catch (err) {
      console.error("Delete category error:", err);
      toast.error("Failed to delete category.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Department Taxonomies
            </h3>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              {categories.length} Departments
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Active supermarket departments synced with user storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Category Button */}
          <Button
            type="button"
            size="sm"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-xs"
          >
            <PlusIcon className="size-4" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search categories by code or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <table className="w-full min-w-[880px] divide-y divide-gray-200 dark:divide-gray-800 text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/40 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3.5 whitespace-nowrap">Code / ID</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Category (Spanish)</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Category (English)</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Icon Key</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70 text-gray-700 dark:text-gray-300">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-sm font-medium">No categories match your search.</p>
                  <p className="text-xs text-gray-400 mt-1">Try another keyword or create a new category.</p>
                </td>
              </tr>
            ) : (
              paginatedCategories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                >
                  {/* Code / ID */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                    <span className="font-bold text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-500/15 px-2.5 py-1 rounded-md inline-block">
                      {cat.id}
                    </span>
                  </td>

                  {/* Spanish Name */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                    {cat.name}
                  </td>

                  {/* English Name */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {cat.nameEn || "—"}
                  </td>

                  {/* Icon Key */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                      {cat.icon || "all"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge
                      color={cat.status === "inactive" ? "light" : "success"}
                      className="whitespace-nowrap px-2.5 py-0.5"
                    >
                      {cat.status === "inactive" ? "Inactive" : "Active"}
                    </Badge>
                  </td>

                  {/* Actions: Edit & Delete */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cat)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                        title="Edit category"
                      >
                        <PencilIcon className="size-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(cat)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-error-600 bg-error-50/60 dark:bg-error-500/10 hover:bg-error-100 dark:hover:bg-error-500/20 transition"
                        title="Delete category"
                      >
                        <TrashBinIcon className="size-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredCategories.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="m-4 max-w-[550px]"
      >
        <div className="relative w-full max-w-[550px] rounded-3xl bg-white p-6 lg:p-7 dark:bg-gray-900">
          <div className="mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingCategory ? `Edit Department: ${editingCategory.name}` : "Add New Category"}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {editingCategory
                ? "Update department names, icon key, and visibility on customer storefront."
                : "Create a new supermarket department for catalog organization and online ordering."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Name in Spanish */}
            <div>
              <Label>Category Name (Spanish) *</Label>
              <Input
                type="text"
                placeholder="e.g. Alimentos Ecológicos / Despensa"
                value={nameEs}
                onChange={(e) => setNameEs(e.target.value)}
                required
              />
            </div>

            {/* Category Name in English */}
            <div>
              <Label>Category Name (English)</Label>
              <Input
                type="text"
                placeholder="e.g. Organic & Bio Products"
                value={nameEn}
                onChange={(e) => handleNameEnChange(e.target.value)}
              />
            </div>

            {/* Code / ID Slug */}
            <div>
              <Label>Code / ID Slug {editingCategory ? "(Permanent ID)" : "*"}</Label>
              <Input
                type="text"
                placeholder="e.g. organic-bio"
                value={code}
                disabled={!!editingCategory}
                onChange={(e) => setCode(e.target.value)}
                className={editingCategory ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800" : ""}
                required
              />
              <p className="mt-1 text-[11px] text-gray-400">
                {editingCategory
                  ? "Category ID cannot be changed because catalog products reference this code."
                  : "Unique identifier used in database and filtering (lowercase letters, numbers, hyphens)."}
              </p>
            </div>

            {/* Icon Key & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Department Icon</Label>
                <CustomSelect
                  options={ICON_OPTIONS}
                  value={icon}
                  onChange={(val) => setIcon(val)}
                  placeholder="Select icon..."
                />
              </div>

              <div>
                <Label>Department Status</Label>
                <CustomSelect
                  options={STATUS_OPTIONS}
                  value={status}
                  onChange={(val) => setStatus(val as "active" | "inactive")}
                  placeholder="Select status..."
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingCategory
                  ? "Save Changes"
                  : "Create Category"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <Modal
          isOpen={!!categoryToDelete}
          onClose={() => !isDeleting && setCategoryToDelete(null)}
          className="m-4 max-w-[420px]"
        >
          <div className="relative w-full max-w-[420px] rounded-3xl bg-white p-6 dark:bg-gray-900 text-center">
            {/* Warning Icon Badge */}
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400">
              <TrashBinIcon className="size-7" />
            </div>

            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              Delete Department?
            </h4>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-white">
                "{categoryToDelete.name}"
              </strong>{" "}
              (<span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">{categoryToDelete.id}</span>)?
              This department will be permanently removed from the catalog.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setCategoryToDelete(null)}
                className="w-full rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isDeleting}
                onClick={confirmDeleteCategory}
                className="w-full rounded-xl bg-error-600 hover:bg-error-700 text-white font-semibold"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
