import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Chatbot } from "@/components/Chatbot";

// Using local system fallback font styles to allow compilation in offline sandboxed environments
const geistSans = {
  variable: "font-sans",
};

const geistMono = {
  variable: "font-mono",
};

export const metadata: Metadata = {
  title: "Muki Crafty Cards v2 | Personalized Handcrafted Greeting Cards",
  description: "Browse, personalize, and purchase beautiful handcrafted greeting cards for every occasion. Rebuilt on modern tech with Canvas customization, AI support, and instant payouts.",
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <Providers>
          {children}
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}

