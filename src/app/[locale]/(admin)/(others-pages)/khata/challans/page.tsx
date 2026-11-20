import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import KhataChallansView from "@/components/khata/KhataChallansView";

export async function generateMetadata() {
  return {
    title: "Delivery Notes & Slips | SuperBarrio Admin",
    description: "Print delivery slips and track hospitality deliveries.",
  };
}

export default function ChallansPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Delivery Notes & Slips" />
      <KhataChallansView />
    </div>
  );
}
