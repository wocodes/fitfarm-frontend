import type { Metadata } from "next";
import "./globals.css";
import AuthInitializer from "./components/AuthInitializer";
import TopProgressBar from "./components/TopProgressBar";
import ThemeInitializer from "./components/ThemeInitializer";

export const metadata: Metadata = {
  title: "FitFarmHQ Admin Center",
  description: "Secure gym management console for FitFarmHQ gym owners and staff.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0f0f11] text-white">
        <TopProgressBar />
        <ThemeInitializer />
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}
