import type { Metadata } from "next";
import "./globals.css";
import AuthInitializer from "./components/AuthInitializer";
import TopProgressBar from "./components/TopProgressBar";
import ThemeInitializer from "./components/ThemeInitializer";

export const metadata: Metadata = {
  title: "FitFarmHQ Admin Center",
  description: "Gym Management Admin Center Dashboard",
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
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
