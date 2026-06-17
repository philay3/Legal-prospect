import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legal Prospector",
  description: "Find law firm prospects by ZIP code.",
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
