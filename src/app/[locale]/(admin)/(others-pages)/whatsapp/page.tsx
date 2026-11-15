import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import WhatsAppQRScanner from "@/components/whatsapp/WhatsAppQRScanner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp | SMBURIO Admin",
  description: "Connect and manage WhatsApp from the admin panel",
};

export default function WhatsAppPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="WhatsApp" />
      <WhatsAppQRScanner />
    </div>
  );
}
