import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nagarathar Sangam KSA - CMS",
  description: "Content Management System for Nagarathar Sangam KSA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cinzel+Decorative:wght@700&family=Cormorant+Garamond:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
