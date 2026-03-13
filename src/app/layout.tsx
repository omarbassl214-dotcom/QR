import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body
        className={`antialiased selection:bg-gold/30 selection:text-gold bg-obsidian text-slate-100 min-h-screen flex flex-col font-sans`}
      >
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-obsidian to-obsidian pointer-events-none"></div>
        {children}
      </body>
    </html>
  );
}
