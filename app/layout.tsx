import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Header } from "@/app/components/layout/Header";

export const metadata: Metadata = {
  title: "Lizard Exchange",
  description: "Non-custodial multi-route crypto swap & payments.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 px-4 py-6 md:px-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
