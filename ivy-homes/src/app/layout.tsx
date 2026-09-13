import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Ivy Homes — Find Your Perfect Property in Hyderabad',
  description: 'Browse premium residential properties, rentals and builder projects across Hyderabad. Real listings, verified by Ivy Homes.',
  keywords: 'property, real estate, Hyderabad, apartments, villas, rentals, buy home',
  openGraph: {
    title: 'Ivy Homes — Premium Property Platform',
    description: 'Discover, save and compare premium properties in Hyderabad.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
