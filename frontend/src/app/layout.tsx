import type { Metadata } from "next";
import "./globals.css";
import { AppPreferences } from "@/components/providers/AppPreferences";

export const metadata: Metadata = {
  title: "FusionOps — Air Operations",
  description: "Live multi-source aircraft tracking and operational awareness.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className="dark bg-slate-950">
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased dark:bg-slate-950 dark:text-slate-100">
        <AppPreferences>{children}</AppPreferences>
      </body>
    </html>
  );
}
