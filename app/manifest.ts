import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pankh — Punjab Poultry Farm Intelligence",
    short_name: "Pankh | ਪੰਖ",
    description:
      "Punjabi-first poultry disease risk surveillance, veterinary teleconsultation, and farm economics tracking.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF9F5",
    theme_color: "#8C3B1A",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
