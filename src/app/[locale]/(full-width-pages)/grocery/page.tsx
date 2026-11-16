import { redirect } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function GroceryPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  redirect({ href: "/", locale });
}
