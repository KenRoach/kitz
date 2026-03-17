import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kitz - AI Business OS",
  description: "AI Business Operating System for LATAM SMBs",
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
