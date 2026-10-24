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

export const metadata: Metadata = {
  title: "FitFarmHQ — Gym Management & Member Access SaaS",
  description: "FitFarmHQ helps gyms manage members, subscriptions, check-ins, staff, and branded member portals from one cloud dashboard.",
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
