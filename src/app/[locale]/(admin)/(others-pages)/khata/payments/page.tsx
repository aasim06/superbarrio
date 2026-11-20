import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import KhataPaymentsView from "@/components/khata/KhataPaymentsView";

export async function generateMetadata() {
  return {
    title: "Payments & Collections | SuperBarrio Admin",
    description: "Track payments received from hotels and clubs.",
  };
}

export default function PaymentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Payments & Collections" />
      <KhataPaymentsView />
    </div>
  );
}
