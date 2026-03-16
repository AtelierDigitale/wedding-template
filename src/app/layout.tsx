import type { Metadata } from "next";
import { Dancing_Script, Lato } from "next/font/google";
import "./globals.css";

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Marcella & Francesco - 29 Agosto 2026",
  description: "Il nostro matrimonio - 29 Agosto 2026 a Ca' Ross, Formigine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${dancingScript.variable} ${lato.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
