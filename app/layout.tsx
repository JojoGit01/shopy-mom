import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopy Mom",
  description: "Wishlist SHEIN simple et rapide",
  icons: {
    icon: "/logo_shopy_mom.png",
    shortcut: "/logo_shopy_mom.png",
    apple: "/logo_shopy_mom.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-slate-100">
        {/* Layout vertical */}
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
