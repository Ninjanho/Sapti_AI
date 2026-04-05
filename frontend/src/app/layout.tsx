import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sapti AI — The Evolving Intelligence",
  description:
    "Sapti is an evolving AI companion powered by the Hive Mind Protocol. It learns, grows, and becomes wiser with every conversation.",
  keywords: ["AI", "companion", "hive mind", "evolving AI", "Sapti"],
  openGraph: {
    title: "Sapti AI — The Evolving Intelligence",
    description: "Meet Sapti — an AI that evolves through conversation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
