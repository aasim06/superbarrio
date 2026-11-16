import { MetadataRoute } from "next";
import { GROCERY_CATEGORIES } from "@/data/groceryData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://superbarrio.es";
  const now = new Date();

  // Core Static Pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          es: `${baseUrl}/es`,
          en: `${baseUrl}/en`,
          "x-default": `${baseUrl}`,
        },
      },
    },
    {
      url: `${baseUrl}/grocery/privacidad`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: {
        languages: {
          es: `${baseUrl}/es/grocery/privacidad`,
          en: `${baseUrl}/en/grocery/privacidad`,
        },
      },
    },
    {
      url: `${baseUrl}/grocery/aviso-legal`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: {
        languages: {
          es: `${baseUrl}/es/grocery/aviso-legal`,
          en: `${baseUrl}/en/grocery/aviso-legal`,
        },
      },
    },
    {
      url: `${baseUrl}/grocery/terminos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: {
        languages: {
          es: `${baseUrl}/es/grocery/terminos`,
          en: `${baseUrl}/en/grocery/terminos`,
        },
      },
    },
    {
      url: `${baseUrl}/grocery/politica-cookies`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: {
        languages: {
          es: `${baseUrl}/es/grocery/politica-cookies`,
          en: `${baseUrl}/en/grocery/politica-cookies`,
        },
      },
    },
  ];

  // Category Pages
  GROCERY_CATEGORIES.forEach((cat) => {
    if (cat.id === "all") return;
    routes.push({
      url: `${baseUrl}/grocery?category=${cat.id}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          es: `${baseUrl}/es/grocery?category=${cat.id}`,
          en: `${baseUrl}/en/grocery?category=${cat.id}`,
        },
      },
    });
  });

  return routes;
}
