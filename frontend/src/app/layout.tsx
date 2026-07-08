import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SidebarLayout from "./SidebarLayout";
import { SimulationProvider } from "../context/SimulationContext";
import { ThemeProvider } from "../context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLM Playground Studio",
  description: "Learn and compare LLM APIs, prompt engineering strategies, tokenizers, and vector embeddings.",
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
      <body className="h-full font-sans transition-colors duration-200">
        <ThemeProvider>
          <SimulationProvider>
            <SidebarLayout>{children}</SidebarLayout>
          </SimulationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
