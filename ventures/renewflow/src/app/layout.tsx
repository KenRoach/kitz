import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RenewFlow - Warranty Renewal Platform",
  description: "Warranty Renewal SaaS for LATAM IT resellers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
