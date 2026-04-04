import { ConvexClientProvider } from "@/components/convex-client-provider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Taini",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="flex min-h-full flex-col">
      <body className={cn("h-full antialiased", "font-sans", geist.variable)}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
