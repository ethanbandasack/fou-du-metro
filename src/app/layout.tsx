import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const parisine = localFont({
  src: [
    {
      path: "./fonts/Parisine/Parisine Regular/Parisine Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Parisine/Parisine Bold/Parisine Bold.otf",
      weight: "700",
      style: "normal",
    }
  ],
  variable: "--font-parisine",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Le fou du métro",
  description: "Quiz sur le transport ferré d'Île-de-France",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${parisine.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
