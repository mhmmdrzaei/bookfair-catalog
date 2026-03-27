import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catalogue Collection",
  description: "Shared inventory and sales tracking for book fairs."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
