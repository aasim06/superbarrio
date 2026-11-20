import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import KhataInvoicesView from "@/components/khata/KhataInvoicesView";

export async function generateMetadata() {
  return {
    title: "Monthly Invoices | SuperBarrio Admin",
    description: "Official Spanish B2B invoices and monthly billing.",
  };
}

export default function InvoicesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Monthly Invoices" />
      <KhataInvoicesView />
    </div>
  );
}
