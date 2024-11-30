import type { Metadata } from 'next';
import {
  Roboto,
  // Bokor
} from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/utils/AuthProvide';
// import ProjectContainer from '@/components/projectContainer';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Toaster } from 'sonner';

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});
// const bokor = Bokor({ subsets: ['latin'], weight: ['400'], display: 'swap' });

export const metadata: Metadata = {
  title: 'BasketJoin',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang='en'>
        <body
          // className={`${roboto.className} bg-gradient-to-t from-orange-200 via-orange-100 to-orange-100 flex flex-col min-h-screen max-w-[1100px] mx-auto`}
          className={`${roboto.className} bg-gradient-to-t bg-zinc-950 flex flex-col min-h-screen max-w-[1100px] mx-auto text-zinc-300`}
        >
          <Header />
          <main className='grow px-4 pt-2'>{children}</main>
          <Footer />
          <Toaster richColors />
        </body>
      </html>
    </AuthProvider>
  );
}
