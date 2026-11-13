import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Invitation Maker — Made for your moments',
  description: 'Thoughtfully designed invitations for every kind of celebration. Choose a design, make it yours, and download something beautiful.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
