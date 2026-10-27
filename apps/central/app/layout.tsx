import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitfarmhq.com";
const siteTitle = "FitFarmHQ — Gym Management & Access Software";
const siteDescription =
  "Run your gym from one dashboard: members, subscriptions, access gates, staff, payments, and a branded member portal. Start your free trial today.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | FitFarmHQ",
  },
  description: siteDescription,
  applicationName: "FitFarmHQ",
  keywords: [
    "gym management software",
    "gym access control",
    "gym membership software",
    "fitness club management",
    "biometric gym access",
    "gym billing software",
    "member portal",
    "gym management Nigeria",
    "FitFarmHQ",
  ],
  authors: [{ name: "FitFarmHQ" }],
  creator: "FitFarmHQ",
  publisher: "FitFarmHQ",
  category: "Business Software",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "FitFarmHQ",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FitFarmHQ gym management dashboard with member access control and subscriptions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakarta.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#070709] text-white font-sans selection:bg-orange-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
