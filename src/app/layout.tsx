import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth/session";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from "@/components/FeedbackWidget";

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
    <html lang="en">
      <body>
        <NavBar user={user} />
        {children}
        <Footer />
        <FeedbackWidget />
      </body>
    </html>
  );
}
