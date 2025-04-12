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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div
          className="fixed top-0 left-0 w-full h-full z-[-1] bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1532957508388-0dff4f470dd6?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
            opacity: 0.3, // Adjust the opacity as needed
          }}
        ></div>
        {children}
      </body>
    </html>
  );
}
