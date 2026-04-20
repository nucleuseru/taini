"use client";

import { ProjectCreationDialog } from "@/app/(dashboard)/project-creation-dialog";
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
import { api } from "@repo/convex/api";
import { useQuery } from "convex/react";
import { FolderOpen, Home, Layers } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const recentProjects = useQuery(api.project.list, {
    paginationOpts: { cursor: null, numItems: 5 },
  });

  return (
    <Sidebar className="border-transparent text-slate-300">
      <SidebarContent className="mt-16">
        <SidebarGroup className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={pathname === "/home"} asChild>
                <Link href="/home">
                  <Home className="size-4" />
                  <span className="font-medium">Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={pathname === "/projects"} asChild>
                <Link href="/projects">
                  <FolderOpen className="size-4" />
                  <span className="font-medium">Projects</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={pathname === "/assets"} asChild>
                <Link href="/assets">
                  <Layers className="size-4" />
                  <span className="font-medium">Assets</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-foreground/50 mb-4 px-7 text-[10px] font-bold tracking-widest uppercase">
            Recent Projects
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-4">
            <SidebarMenu className="gap-1">
              {recentProjects?.page.map((project) => (
                <SidebarMenuItem key={project._id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes(project._id)}
                    className="group flex h-9 items-center gap-3 rounded-lg px-3 transition-all hover:bg-white/5"
                  >
                    <Link href={`/projects/${project._id}/storyboard`}>
                      <div className="bg-primary/10 text-primary group-hover:bg-primary/20 flex size-5 items-center justify-center rounded-sm text-[10px] font-bold">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate text-xs font-medium">
                        {project.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <ProjectCreationDialog />
      </SidebarFooter>
    </Sidebar>
  );
}
