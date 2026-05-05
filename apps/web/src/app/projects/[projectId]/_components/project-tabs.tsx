"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Id } from "@repo/convex/dataModel";
import {
  AudioLinesIcon,
  ImageIcon,
  NotebookIcon,
  User2Icon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const getTabs = (projectId: string) => [
  { name: "Visuals", href: `/projects/${projectId}/gen`, icon: ImageIcon },
  { name: "Audio", href: `/projects/${projectId}/audio`, icon: AudioLinesIcon },
  {
    name: "Elements",
    href: `/projects/${projectId}/elements`,
    icon: User2Icon,
  },
  {
    name: "Storyboard",
    href: `/projects/${projectId}/storyboard`,
    icon: NotebookIcon,
  },
];

export function ProjectTabs() {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.projectId as Id<"project">;
  const tabs = getTabs(projectId);

  const activeTab =
    tabs.find((tab) => pathname.startsWith(tab.href))?.href ??
    tabs[0]?.href ??
    "";

  return (
    <div className="ms:gap-2 mx-auto flex w-min items-center gap-1">
      {tabs.map((tab) => (
        <Button
          variant="ghost"
          className={cn(
            "text-muted-foreground hover:text-foreground hover:bg-muted flex-1 text-xs lg:text-sm",
            activeTab === tab.href && "text-foreground bg-muted",
          )}
          key={tab.href}
          asChild
        >
          <Link href={tab.href as Route}>
            <tab.icon size={20} className="lg:hidden" />
            <span className="hidden lg:block">{tab.name}</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}

export function ProjectTabsSkeleton() {
  const tabs = getTabs("");

  return (
    <div className="mx-auto flex w-min items-center gap-1 sm:gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.href}
          variant="ghost"
          className="text-muted-foreground hover:text-foreground hover:bg-muted flex-1 text-xs lg:text-sm"
        >
          <tab.icon size={20} className="lg:hidden" />
          <span className="hidden lg:block">{tab.name}</span>
        </Button>
      ))}
    </div>
  );
}
