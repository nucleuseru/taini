"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Id } from "@repo/convex/dataModel";
import type { Route } from "next";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const getTabs = (projectId: string) => [
  { name: "Visuals", href: `/projects/${projectId}/gen` },
  { name: "Audio", href: `/projects/${projectId}/audio` },
  { name: "Elements", href: `/projects/${projectId}/elements` },
  { name: "Storyboard", href: `/projects/${projectId}/storyboard` },
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
    <div className="bg-background/50 fixed inset-x-0 top-[68px] z-40 px-6 pb-2 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-2">
        {tabs.map((tab) => (
          <Button
            variant="ghost"
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-muted flex-1 text-xs sm:text-sm",
              activeTab === tab.href && "text-foreground bg-muted",
            )}
            key={tab.href}
            asChild
          >
            <Link href={tab.href as Route}>{tab.name}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}

export function ProjectTabsSkeleton() {
  const tabs = getTabs("");

  return (
    <div className="bg-background/50 fixed inset-x-0 top-[68px] z-40 px-6 pb-2 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.href}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-muted flex-1 text-xs sm:text-sm"
          >
            {tab.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
