import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relocaite — Your Germany action plan",
  description:
    "Discover financial opportunities, work rights, and relocation deadlines with evidence you can trust.",
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
