import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import BackgroundAnimation from '@/components/ui/background';
import { CacheProvider } from '@/context/CacheContext';


export const metadata: Metadata = {
  title: 'Forex Compass',
  description: 'Your all-in-one toolkit for smarter forex trading.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      {/* Head content moved to app/head.tsx for custom fonts */}
      <body className="font-body antialiased bg-background">
        <BackgroundAnimation />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <CacheProvider>
            {children}
          </CacheProvider>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
