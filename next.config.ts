import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statischer Export: die App wird als eigenständige HTML/JS-Datei gebaut
  // und läuft ohne Server direkt aus dem geteilten SharePoint-Ordner (siehe
  // Tech Design in features/PROJ-1-kurssuche-mit-filtern.md).
  output: "export",
  // Next.js verlinkt Assets standardmäßig mit absoluten Pfaden (/_next/...),
  // die bei file://-Aufruf auf die Dateisystemwurzel statt auf den
  // Build-Ordner zeigen. assetPrefix "." macht die Pfade relativ, damit
  // index.html per Doppelklick funktioniert.
  assetPrefix: ".",
};

export default nextConfig;
