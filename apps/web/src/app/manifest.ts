import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Community Power — Preview", short_name: "CP Preview", description: "A synthetic Community Power development preview", start_url: "/", display: "standalone", background_color: "#f7f9fc", theme_color: "#0057b7", icons: [{ src: "/brand/cp-logo.png", sizes: "1408x768", type: "image/png", purpose: "any" }] };
}
