import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gym Setup",
  description: "Configure your FitFarmHQ gym workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
