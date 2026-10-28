import type { Metadata } from "next";
import { Google_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Settle | Get Paid Instantly",
  description:
    "Create the invoice. Get paid. Chase it when it’s late, without the awkward emails.",
  icons: {
    icon: "/logo.ico",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", googleSans.variable, "font-sans", geist.variable)}
    >
      <body
        suppressHydrationWarning
        className={`${googleSans.className} font-sans min-h-full flex flex-col bg-slate-950 text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
