import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { isRtl } from "@/i18n/languages";
import { type Locale, routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Outfit } from "next/font/google";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import "../globals.css";
import type { Metadata, Viewport } from "next";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0E382C" },
    { media: "(prefers-color-scheme: dark)", color: "#04130b" },
  ],
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://superbarrio.es";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SuperBarrio | Supermercado Online España",
    template: "%s | SuperBarrio",
  },
  description:
    "Supermercado online en España con reparto a domicilio en 25 minutos. Frutas, verduras de la huerta, carnes y productos de proximidad.",
  applicationName: "SuperBarrio",
  category: "Grocery & Food Delivery",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SuperBarrio",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    siteName: "SuperBarrio",
    type: "website",
    locale: "es_ES",
    alternateLocale: ["en_US"],
  },
  verification: {
    google: "google-site-verification-placeholder",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const isDark = themeCookie === "dark";

  return (
    <html
      lang={locale}
      dir={isRtl(locale as Locale) ? "rtl" : "ltr"}
      className={isDark ? "dark" : ""}
      data-color-scheme={isDark ? "dark" : "light"}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
