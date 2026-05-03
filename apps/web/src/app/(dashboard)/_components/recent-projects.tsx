import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@repo/convex/api";
import Link from "next/link";

export async function RecentProjects() {
  const recentProjects = await fetchAuthQuery(api.project.list, {
    paginationOpts: { cursor: null, numItems: 5 },
  });

  return (
    <>
      {recentProjects.page.map((project) => (
        <SidebarMenuItem key={project._id}>
          <SidebarMenuButton
            className="group flex h-9 items-center gap-3 rounded-lg px-3 transition-all hover:bg-white/5"
            asChild
          >
            <Link href={`/projects/${project._id}/gen`}>
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
    </>
  );
}

export function RecentProjectsSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton className="h-9 w-full bg-white/5" key={i} />
      ))}
    </>
  );
}
