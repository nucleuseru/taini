"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FolderOpen, Home, Layers, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-transparent">
      <SidebarContent className="mt-16">
        <SidebarGroup className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={pathname === "/home"} asChild>
                <Link href="/home">
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={pathname === "/projects"} asChild>
                <Link href="/projects">
                  <FolderOpen />
                  <span>Projects</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={pathname === "/assets"} asChild>
                <Link href="/assets">
                  <Layers />
                  <span>Assets</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-foreground/75 mb-4 px-7 text-[10px] font-bold tracking-widest uppercase">
            Recent Projects
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1 px-4">
            <SidebarMenu>
              {/* {recentProjects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    asChild
                    className="group flex h-auto items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                  >
                    <Link href="#">
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-white/10">
                        <Image
                          src={project.thumbnail}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="truncate text-sm font-medium text-slate-300">
                        {project.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))} */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button variant="outline" size="lg">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
