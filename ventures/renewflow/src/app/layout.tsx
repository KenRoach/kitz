import type { Metadata } from "next";
import { Shell } from "@/components/layout/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flow - Warranty Renewal Platform",
  description: "Warranty Renewal SaaS for LATAM IT resellers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
