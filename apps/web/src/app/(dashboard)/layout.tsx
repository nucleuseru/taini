import { Navbar } from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React, { Suspense } from "react";
import { AppSidebar } from "./_components/app-sidebar";
import {
  RecentProjects,
  RecentProjectsSkeleton,
} from "./_components/recent-projects";

export default function DashboardLayout({ children }: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <Navbar />
      <AppSidebar>
        <Suspense fallback={<RecentProjectsSkeleton />}>
          <RecentProjects />
        </Suspense>
      </AppSidebar>
      <main className="flex-1 overflow-y-auto pt-16">{children}</main>
    </SidebarProvider>
  );
}
