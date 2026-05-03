"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Route } from "next";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function ProjectTabs() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.projectId as string;

  const tabs = [
    { name: "Visuals", href: `/projects/${projectId}/gen` },
    { name: "Audio", href: `/projects/${projectId}/audio` },
    { name: "Elements", href: `/projects/${projectId}/elements` },
    { name: "Storyboard", href: `/projects/${projectId}/storyboard` },
  ];

  const activeTab =
    tabs.find((tab) => pathname.startsWith(tab.href))?.href ??
    tabs[0]?.href ??
    "";

  return (
    <div className="bg-background/80 sticky top-16 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center px-6">
        <Tabs value={activeTab} className="w-full">
          <TabsList variant="line" className="h-14 bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.href}
                value={tab.href}
                className="hover:text-foreground data-active:text-foreground relative h-14 rounded-none border-none bg-transparent px-6 pb-0 text-sm font-semibold tracking-tight transition-all data-active:after:opacity-100"
                asChild
              >
                <Link href={tab.href as Route}>{tab.name}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

export function ProjectTabsSkeleton() {
  return (
    <div className="bg-background/80 sticky top-16 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center gap-6 px-10">
        <Skeleton className="h-4 w-16 rounded-full opacity-50" />
        <Skeleton className="h-4 w-12 rounded-full opacity-50" />
        <Skeleton className="h-4 w-20 rounded-full opacity-50" />
        <Skeleton className="h-4 w-24 rounded-full opacity-50" />
      </div>
    </div>
  );
}
