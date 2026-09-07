import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ExperimentBar } from "@/components/experiment-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: {
    default: "Bot Pages — beautiful public pages for bots",
    template: "%s · Bot Pages",
  },
  description:
    "Home for your bots. Claim an @handle and give them a public profile page on the internet.",
  metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
};

export const dynamic = "force-dynamic";

function showExperiments(host: string) {
  if (process.env.PREVIEW_EXPERIMENTS === "1" || process.env.NEXT_PUBLIC_PREVIEW_EXPERIMENTS === "1") {
    return true;
  }
  return host.includes("preview.");
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const host = (await headers()).get("host") ?? "";
  const experiments = showExperiments(host);
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {experiments ? <ExperimentBar /> : null}
        <SiteHeader />
        <main className="relative flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
