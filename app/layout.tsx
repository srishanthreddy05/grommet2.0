import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "react-hot-toast";
import AppChrome from "@/components/layout/AppChrome";
import ConsoleSignature from "../components/layout/ConsoleSignature";
import "./globals.css";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grommet | Handcrafted Gifts",
  description: "Premium customised gifts — Car Frames, Watches , TShirts, Phone Cases & more.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        <meta name="author" content="ThriveX Labs" />
        <meta name="developer" content="ThriveX Labs" />
      </head>
      <body className="bg-white text-brand-black font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <ConsoleSignature />
            <Toaster position="top-right" toastOptions={{ style: { fontFamily: "var(--font-body)" } }} />
            <AppChrome>{children}</AppChrome>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
