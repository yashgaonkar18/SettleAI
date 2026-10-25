import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";
import "./globals.css";


const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Settle | Get Paid Instantly",
  description:
    "Create the invoice. Get paid. Chase it when it’s late, without the awkward emails.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${googleSans.variable} h-full antialiased`}
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
