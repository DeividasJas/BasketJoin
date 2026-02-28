import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/utils/AuthProvide";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BasketJoin",
  description: "Find and join basketball games near you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className} relative mx-auto flex min-h-screen w-full max-w-[1100px] flex-col bg-zinc-50 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200`}>
        <AuthProvider>
          <ThemeProvider attribute="class">
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
