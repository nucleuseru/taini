"use client";

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
import { FolderOpen, Home, Layers } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { ProjectCreationDialog } from "./project-creation-dialog";

export function AppSidebar({ children }: React.PropsWithChildren) {
  const pathname = usePathname();

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
            <SidebarMenu className="gap-1">{children}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <ProjectCreationDialog />
      </SidebarFooter>
    </Sidebar>
  );
}
