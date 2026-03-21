import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KitZ — Company Factory OS",
  description: "AI-native company factory that launches and operates portfolio ventures",
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
