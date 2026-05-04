import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Debales AI — Multi-Tenant AI Assistant Platform",
  description:
    "Debales AI is a multi-tenant SaaS platform for building and managing AI-powered assistants with Shopify and CRM integrations.",
  keywords: ["AI", "chatbot", "multi-tenant", "SaaS", "Shopify", "CRM"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} h-full`}>
        <body className="min-h-full flex flex-col antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
