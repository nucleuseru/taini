import { Navbar } from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "./_components/app-sidebar";

export default function DashboardLayout({ children }: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <Navbar />
      <AppSidebar />
      <main className="flex-1 overflow-y-auto pt-16">{children}</main>
    </SidebarProvider>
  );
}
