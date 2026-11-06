import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ChartTabProps {
  selected?: "monthly" | "weekly" | "annually";
  onChange?: (period: "monthly" | "weekly" | "annually") => void;
}

const ChartTab: React.FC<ChartTabProps> = ({ selected: controlledSelected, onChange }) => {
  const t = useTranslations("ecommerce.statistics");
  const [internalSelected, setInternalSelected] = useState<
    "monthly" | "weekly" | "annually"
  >("monthly");

  const current = controlledSelected ?? internalSelected;

  const handleSelect = (period: "monthly" | "weekly" | "annually") => {
    if (onChange) {
      onChange(period);
    } else {
      setInternalSelected(period);
    }
  };

  const getButtonClass = (option: "monthly" | "weekly" | "annually") =>
    current === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex max-h-10 items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      <button
        onClick={() => handleSelect("monthly")}
        className={`w-full rounded-md px-3 py-2 text-theme-sm font-medium hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "monthly",
        )}`}
      >
        {t("monthly")}
      </button>

      <button
        onClick={() => handleSelect("weekly")}
        className={cn(
          "w-full rounded-md px-3 py-1.5 text-theme-sm font-medium hover:text-gray-900 rtl:min-w-20 dark:hover:text-white",
          getButtonClass("weekly"),
        )}
      >
        Weekly
      </button>

      <button
        onClick={() => handleSelect("annually")}
        className={`w-full rounded-md px-3 py-2 text-theme-sm font-medium hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "annually",
        )}`}
      >
        {t("annually")}
      </button>
    </div>
  );
};

export default ChartTab;
