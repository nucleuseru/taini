import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Navbar } from "./navbar";

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
