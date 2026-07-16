import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kurssuche",
  description: "Durchsuchbare AMS-Kursangebote für Berater:innen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
