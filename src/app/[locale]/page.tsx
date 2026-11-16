import React from "react";
import GroceryCatalog from "@/components/grocery/GroceryCatalog";
import GroceryJsonLd from "@/components/grocery/GroceryJsonLd";
import GroceryLayoutWrapper from "@/components/grocery/GroceryLayoutWrapper";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://superbarrio.es";

  const title = isEs
    ? "SuperBarrio Madrid | Supermercado y Frutería Online a Domicilio en 25 Min"
    : "SuperBarrio Madrid | Farm-Fresh Online Supermarket & Express Grocery Delivery";

  const description = isEs
    ? "Compra frutas y verduras frescas de la huerta, carnes de origen y productos básicos en Madrid. Reparto exprés a tu puerta en menos de 25 minutos. ¡Envío gratis >25€!"
    : "Order farm-fresh local fruits, vegetables, artisan meats, and daily essentials delivered in under 25 minutes across Madrid. Free delivery over €25!";

  const keywords = isEs
    ? [
        "supermercado online madrid",
        "frutería a domicilio madrid",
        "comprar fruta y verdura online",
        "supermercado de barrio",
        "entrega rápida supermercado 25 minutos",
        "comprar comida fresca online españa",
        "carnicería online madrid",
        "tienda de alimentación domicilio",
        "verdura fresca de la huerta",
        "superbarrio supermercado",
      ]
    : [
        "online grocery store madrid",
        "fresh fruit delivery madrid",
        "express grocery delivery 25 min",
        "local supermarket spain",
        "order fresh produce online",
        "same day grocery delivery madrid",
        "farm to door grocery",
      ];

  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    authors: [{ name: "SuperBarrio España" }],
    creator: "SuperBarrio",
    publisher: "SuperBarrio España S.L.",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}`,
      languages: {
        "es-ES": `${baseUrl}/es`,
        "en-US": `${baseUrl}/en`,
        "x-default": `${baseUrl}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}`,
      siteName: "SuperBarrio",
      locale: isEs ? "es_ES" : "en_US",
      alternateLocale: isEs ? ["en_US"] : ["es_ES"],
      type: "website",
      images: [
        {
          url: `${baseUrl}/images/banner/mobile-hero-1.jpg`,
          width: 1200,
          height: 630,
          alt: "SuperBarrio - Alimentos Frescos de Granja",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/images/banner/mobile-hero-1.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <GroceryLayoutWrapper>
      <GroceryJsonLd locale={locale} />
      <GroceryCatalog />
    </GroceryLayoutWrapper>
  );
}
