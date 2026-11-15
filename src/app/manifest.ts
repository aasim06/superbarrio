import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SuperBarrio Supermercado",
    short_name: "SuperBarrio",
    description: "Supermercado online en Madrid con alimentos frescos de granja directos a tu puerta en 25 minutos.",
    start_url: "/es/grocery",
    display: "standalone",
    background_color: "#0E382C",
    theme_color: "#0E382C",
    orientation: "portrait",
    categories: ["shopping", "food", "lifestyle"],
    icons: [
      {
        src: "/icon.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
