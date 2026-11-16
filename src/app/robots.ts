import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://superbarrio.es";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/grocery",
          "/es/grocery",
          "/en/grocery",
          "/grocery/*",
          "/images/*",
          "/favicon.ico",
        ],
        disallow: [
          "/api/",
          "/dashboard",
          "/dashboard/*",
          "/admin",
          "/admin/*",
          "/orders",
          "/orders/*",
          "/inventory",
          "/inventory/*",
          "/customers",
          "/customers/*",
          "/signin",
          "/_next/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/admin/", "/signin"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
