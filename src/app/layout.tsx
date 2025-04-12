import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NoteFlow Summarizer',
  description: 'Summarize your notes with AI',
  // Optionally add other meta tags here
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-cover bg-center`}
        style={{
          backgroundAttachment: 'fixed',
          padding: 0,
          height: '100vh',
          width: '100vw',
        }}
      >
        <div className="bg-white bg-opacity-80 min-h-screen flex justify-center items-center">
          {children}
        </div>
      </body>
    </html>
  );
}
