import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import { CartProvider } from "@/components/CartProvider";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "The Hanger | Everyday pieces, considered",
    template: "%s | The Hanger",
  },
  description: "Thoughtful clothing and everyday favorites from The Hanger.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header userName={userName} />
          {children}
          <footer className="site-footer">
            <Link href="/" className="brand-mark">
              the hanger<span>.</span>
            </Link>
            <p>Good clothes for your everyday.</p>
            <span>© {new Date().getFullYear()} The Hanger</span>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
