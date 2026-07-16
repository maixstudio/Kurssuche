import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statischer Export: die App wird als eigenständige HTML/JS-Datei gebaut
  // und läuft ohne Server direkt aus dem geteilten SharePoint-Ordner (siehe
  // Tech Design in features/PROJ-1-kurssuche-mit-filtern.md).
  output: "export",
};

export default nextConfig;
