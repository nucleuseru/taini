import { ConvexClientProvider } from "@/components/convex-client-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Taini",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="flex min-h-full flex-col antialiased">
      <body
        className={cn(
          "h-full antialiased",
          "font-sans",
          inter.variable,
          manrope.variable,
        )}
        cz-shortcut-listen="true"
      >
        <Toaster theme="dark" />
        <TooltipProvider>
          <ConvexClientProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </ConvexClientProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
