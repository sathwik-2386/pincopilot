import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Pin } from 'lucide-react';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PinPilot | Turn Product Links Into Pinterest Pins',
  description:
    'Semi-automated Pinterest affiliate pin generator. Paste any product URL to extract data and generate SEO-optimized Pinterest pins.',
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
      <body className="min-h-full flex flex-col bg-[#fbfbfd] text-slate-900 font-sans selection:bg-red-100 selection:text-red-900">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <Pin className="h-3.5 w-3.5 fill-white rotate-45 transform" />
              </div>
              <span className="font-bold text-slate-900 text-sm">
                Pin<span className="text-red-600">Pilot</span>
              </span>
              <span className="text-slate-300">|</span>
              <span>Turn Product Links Into Pinterest Pins</span>
            </div>

            <div className="flex items-center gap-6 text-slate-500 text-xs">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Generate
              </Link>
              <Link href="/history" className="hover:text-slate-900 transition-colors">
                History
              </Link>
              <Link href="/settings" className="hover:text-slate-900 transition-colors">
                Settings
              </Link>
              <span className="text-slate-400">
                Semi-automated &bull; Safe manual publishing
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
