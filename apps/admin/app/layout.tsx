import type { Metadata } from "next";
import "./globals.css";
import AuthInitializer from "./components/AuthInitializer";
import TopProgressBar from "./components/TopProgressBar";

export const metadata: Metadata = {
  title: "FitCloud Admin Center",
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
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
