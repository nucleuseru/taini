import { Navbar } from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Navbar />
      <AppSidebar />
      <main className="flex-1 overflow-y-auto pt-16">{children}</main>
    </SidebarProvider>
  );
}
