import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth/session";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from "@/components/FeedbackWidget";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-hanken",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Legal Prospector",
  description: "Find law firm prospects by ZIP code.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${hankenGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <NavBar user={user} />
        {children}
        <Footer />
        <FeedbackWidget />
      </body>
    </html>
  );
}
