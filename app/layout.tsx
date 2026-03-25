import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kambah's Kitchen Planner",
  description: "AI-powered kitchen layout planner — describe changes in chat and see them on the floor plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
