import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ScriptInjector } from "@/components/common/ScriptInjector";
import { getSettings } from "@/lib/store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.siteDescription,
    openGraph: {
      title: settings.siteName,
      description: settings.siteDescription,
      type: "website",
      locale: "tr_TR",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <ScriptInjector html={settings.globalHeadScript} />
        {children}
      </body>
    </html>
  );
}
