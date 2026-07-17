import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarLayout from "./SidebarLayout";
import { SimulationProvider } from "../context/SimulationContext";
import { ThemeProvider } from "../context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "LLM Playground Studio",
  description: "An advanced AI studio to explore, compare, and build with LLMs, tokenizers, vector embeddings, and full RAG pipelines.",
  keywords: ["LLM", "RAG", "AI Playground", "Gemini", "ChatGPT", "Vector Database", "Embeddings"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="h-full font-sans transition-colors duration-300">
        <ThemeProvider>
          <SimulationProvider>
            <SidebarLayout>{children}</SidebarLayout>
          </SimulationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
