import { Navbar } from "@/components/Navbar";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ask-ltt-wan",
  description: "Ask anything about the LTT WAN show!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-black")}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
