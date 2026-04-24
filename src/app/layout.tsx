import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${parisine.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
