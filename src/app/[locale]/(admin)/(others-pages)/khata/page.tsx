import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import KhataClientsView from "@/components/khata/KhataClientsView";

export async function generateMetadata() {
  return {
    title: "B2B Clients Directory | SuperBarrio Admin",
    description: "Manage B2B hospitality clients, credit limits, and balances.",
  };
}

export default async function KhataPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="B2B Clients Directory" />
      <KhataClientsView />
    </div>
  );
}
