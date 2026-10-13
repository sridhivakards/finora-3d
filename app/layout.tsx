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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060913] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
