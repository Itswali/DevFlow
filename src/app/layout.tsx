import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevFlow",
  description: "A realtime Project task management and code reviewer.",
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
      <body className="bg-slate-50">

        {/* Main Wrapper */}
        <div className="flex h-screen w-full p-4 gap-4">


          {/* Page Content goes on the right */}
          <main className="flex-1 h-full overflow-y-auto">
            {children}
          </main>

        </div>
<Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

