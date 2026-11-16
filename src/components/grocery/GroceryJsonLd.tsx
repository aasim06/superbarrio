import React from "react";
import { GROCERY_PRODUCTS } from "@/data/groceryData";

interface GroceryJsonLdProps {
  locale: string;
}

export const GroceryJsonLd: React.FC<GroceryJsonLdProps> = ({ locale }) => {
  const isEs = locale === "es";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://superbarrio.es";

  // 1. Organization & Local Grocery Store Schema
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": ["OnlineStore", "GroceryStore", "LocalBusiness"],
    "@id": `${baseUrl}/#store`,
    name: "SuperBarrio España",
    alternateName: "SuperBarrio Supermercado Online",
    url: baseUrl,
    logo: `${baseUrl}/images/logo/logo.svg`,
    image: `${baseUrl}/images/banner/mobile-hero-1.jpg`,
    description: isEs
      ? "Tu supermercado de barrio online en España. Frutas, verduras y alimentos frescos de la huerta a tu cocina en menos de 25 minutos."
      : "Your local online grocery store in Spain. Farm-fresh fruits, vegetables and everyday essentials delivered in under 25 minutes.",
    telephone: "+34612345678",
    email: "hola@superbarrio.es",
    priceRange: "€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Bizum, Apple Pay, Google Pay",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle Gran Vía, 28",
      addressLocality: "Madrid",
      addressRegion: "Madrid",
      postalCode: "28013",
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.4200,
      longitude: -3.7038,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "23:00",
      },
    ],
    areaServed: [
      {
        "@type": "City",
        name: "Madrid",
      },
      {
        "@type": "Country",
        name: "España",
      },
    ],
    sameAs: [
      "https://wa.me/34612345678",
      "https://instagram.com/superbarrio.es",
    ],
  };

  // 2. WebSite with Sitelinks SearchBox Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "SuperBarrio",
    description: isEs
      ? "Supermercado online con entrega exprés en España"
      : "Online grocery supermarket with express delivery in Spain",
    publisher: {
      "@id": `${baseUrl}/#store`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["es-ES", "en-US"],
  };

  // 3. Top Products ItemList Schema for Google Rich Snippets
  const topProducts = GROCERY_PRODUCTS.slice(0, 12);
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: topProducts.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        "@id": `${baseUrl}/#${p.id}`,
        name: isEs ? p.name : p.nameEn || p.name,
        description: isEs ? p.description : p.descriptionEn || p.description,
        image: `${baseUrl}${p.imageUrl}`,
        sku: p.id,
        category: p.category,
        brand: {
          "@type": "Brand",
          name: "SuperBarrio",
        },
        offers: {
          "@type": "Offer",
          url: `${baseUrl}`,
          priceCurrency: "EUR",
          price: p.price.toFixed(2),
          priceValidUntil: "2027-12-31",
          itemCondition: "https://schema.org/NewCondition",
          availability: p.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: {
            "@id": `${baseUrl}/#store`,
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: p.rating,
          reviewCount: p.reviewsCount || 45,
          bestRating: 5,
          worstRating: 1,
        },
      },
    })),
  };

  // 4. FAQPage Schema (Google Rich Accordion FAQs)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: isEs
      ? [
          {
            "@type": "Question",
            name: "¿Cuánto tarda la entrega de la compra con SuperBarrio?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Entregamos tu pedido fresco en menos de 25 a 35 minutos en Madrid con furgonetas refrigeradas de temperatura controlada.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cuál es el pedido mínimo para envío gratis?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "El envío es completamente gratis para pedidos superiores a 25€ utilizando el cupón FRESH20.",
            },
          },
          {
            "@type": "Question",
            name: "¿Qué métodos de pago aceptáis?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Aceptamos Bizum, tarjetas de crédito y débito (Visa, Mastercard), Apple Pay, Google Pay y pago contra reembolso en efectivo.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cómo se garantiza la frescura de las frutas y verduras?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Todos nuestros productos son seleccionados a diario en granjas y huertas locales de España. Si algún producto no llega en perfecto estado, te lo reemplazamos inmediatamente sin coste.",
            },
          },
        ]
      : [
          {
            "@type": "Question",
            name: "How fast is delivery with SuperBarrio?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "We deliver farm-fresh groceries to your kitchen in 25 to 35 minutes across Madrid using temperature-controlled refrigerated vans.",
            },
          },
          {
            "@type": "Question",
            name: "Is there free delivery?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, delivery is 100% free on all orders over €25 with promo code FRESH20.",
            },
          },
          {
            "@type": "Question",
            name: "What payment methods are supported?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "We accept Bizum, credit & debit cards (Visa, Mastercard), Apple Pay, Google Pay, and Cash on Delivery.",
            },
          },
        ],
  };

  // 5. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isEs ? "Inicio" : "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isEs ? "Supermercado Online" : "Online Grocery",
        item: baseUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
};

export default GroceryJsonLd;
