import { Navbar } from "@/components/navbar";
import { Suspense } from "react";
import { ProjectTabs, ProjectTabsSkeleton } from "./_components/project-tabs";

export default function ProjectLayout({
  children,
}: LayoutProps<"/projects/[projectId]">) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        CenterComponent={
          <Suspense fallback={<ProjectTabsSkeleton />}>
            <ProjectTabs />
          </Suspense>
        }
      />

      <main className="mx-auto w-full flex-1 pt-16">{children}</main>
    </div>
  );
}
