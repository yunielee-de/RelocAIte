import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RelocAIte — Your new chapter in Germany",
  description:
    "One profile. One journey. Understand your employment offer, explore a potential visa route, and prepare your next step in Germany.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
