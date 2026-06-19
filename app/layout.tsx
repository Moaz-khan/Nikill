import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Script from 'next/script';

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";


export const metadata: Metadata = {
  title: "NIKILL | Premium Shoes for Every Step",
  description: "Experience the ultimate comfort and style with NIKILL's latest shoe collections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <FavoritesProvider>
            <CartProvider>
              <Script src="https://cdn.lordicon.com/lordicon.js" strategy="lazyOnload" />
              <Navbar />
              {children}
              <Footer />
            </CartProvider>
          </FavoritesProvider>
      </body>
    </html>
  );
}
