import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalesPulse AI - Voice Sales Agent",
  description: "Interactive AI voice bot for SaaS product demonstrations, sales pitches, and call analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
