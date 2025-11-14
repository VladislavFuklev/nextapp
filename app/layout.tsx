import type { Metadata } from 'next';
import './globals.css';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Next.js',
  description: 'Современное приложение на Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 antialiased"
      >
        <div className="min-h-screen flex flex-col">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
