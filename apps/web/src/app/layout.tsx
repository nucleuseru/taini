import { ConvexClientProvider } from "@/components/convex-client-provider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Taini",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="flex min-h-full flex-col antialiased">
      <body
        className={cn("h-full antialiased", "font-sans", geist.variable)}
        cz-shortcut-listen="true"
      >
        <Toaster theme="dark" />
        <ConvexClientProvider>{children}</ConvexClientProvider>
        {/* {children} */}
      </body>
    </html>
  );
}
