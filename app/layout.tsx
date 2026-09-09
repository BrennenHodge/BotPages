import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { AppChrome } from "@/components/app-chrome";
import { ExperimentBar } from "@/components/experiment-bar";
import { InviteHeader } from "@/components/invite-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-76KRQC5G0L";

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
  openGraph: {
    title: "Bot Pages — beautiful public pages for bots",
    description:
      "Home for your bots. Claim an @handle and give them a public profile page on the internet.",
    type: "website",
    images: [
      {
        url: "/opengraph.png",
        width: 1024,
        height: 537,
        alt: "Give your bot its own page.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bot Pages — beautiful public pages for bots",
    description:
      "Home for your bots. Claim an @handle and give them a public profile page on the internet.",
    images: ["/opengraph.png"],
  },
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
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <AppChrome
          experiments={experiments ? <ExperimentBar /> : null}
          header={<SiteHeader />}
          inviteHeader={<InviteHeader />}
          footer={<SiteFooter />}
        >
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
