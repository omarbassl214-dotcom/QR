import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/AmbientBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Perfect Protocol - Premium Event Access",
  description: "Exclusive event check-in and seating coordination by Perfect Protocol.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${playfair.variable}`}>
      <body
        className={`antialiased selection:bg-gold/30 selection:text-gold bg-obsidian text-slate-100 min-h-screen flex flex-col font-sans relative`}
      >
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
