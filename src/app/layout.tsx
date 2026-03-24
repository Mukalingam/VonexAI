import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vonex AI - AI Voice Agent Platform",
    template: "%s | Vonex AI",
  },
  description:
    "Build, train, and deploy intelligent voice agents powered by AI. No-code voice agent creation with premium voice synthesis and AI reasoning.",
  keywords: [
    "AI voice agent",
    "conversational AI",
    "voice bot",
    "AI phone calls",
    "voice automation",
    "Vonex AI",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Vonex AI",
    title: "Vonex AI - AI Voice Agent Platform",
    description:
      "Build, train, and deploy intelligent voice agents powered by AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100;200;300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
