import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Finora — A Bank Statement That Talks Back',
  description: 'AI-Powered Personal Finance Operating System for Indian Users. Intelligent tracking, ML expense predictions, and conversational finance.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F7F6F0] text-[#1D2923] antialiased selection:bg-[#E5EBDD] selection:text-[#244C3B]">
        {children}
      </body>
    </html>
  );
}
