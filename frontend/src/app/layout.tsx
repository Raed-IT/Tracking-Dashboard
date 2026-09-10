import type { Metadata } from "next";
import "./globals.css";
import { AppPreferences } from "@/components/providers/AppPreferences";

export const metadata: Metadata = {
  title: "Air Operations",
  description: "Live multi-source aircraft tracking and operational awareness.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className="dark bg-slate-950"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const theme = localStorage.getItem("fusionops-theme");
                const language = localStorage.getItem("fusionops-language");
                const root = document.documentElement;
                if (theme === "light" || theme === "dark") {
                  root.classList.remove("light", "dark");
                  root.classList.add(theme);
                  root.dataset.theme = theme;
                }
                if (language === "en" || language === "ar") {
                  root.lang = language;
                  root.dir = language === "ar" ? "rtl" : "ltr";
                }
              } catch { /* Storage can be unavailable in privacy modes. */ }
            })();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased dark:bg-slate-950 dark:text-slate-100">
        <AppPreferences>{children}</AppPreferences>
      </body>
    </html>
  );
}
