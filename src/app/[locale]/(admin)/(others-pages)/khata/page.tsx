import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import KhataManagerView from "@/components/khata/KhataManagerView";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("b2bInvoices");
  return {
    title: `${t("pageTitle")} | SuperBarrio Admin`,
    description: t("pageDescription"),
  };
}

export default async function KhataPage() {
  const t = await getTranslations("b2bInvoices");

  return (
    <div>
      <PageBreadcrumb pageTitle={t("pageTitle")} />
      <KhataManagerView />
    </div>
  );
}
