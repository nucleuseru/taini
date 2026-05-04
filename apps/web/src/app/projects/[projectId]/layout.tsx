import { Navbar } from "@/components/navbar";
import { Suspense } from "react";
import { ProjectTabs, ProjectTabsSkeleton } from "./_components/project-tabs";

export default function ProjectLayout({
  children,
}: LayoutProps<"/projects/[projectId]">) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={<ProjectTabsSkeleton />}>
        <ProjectTabs />
      </Suspense>

      <main className="mx-auto w-full max-w-screen-2xl flex-1 pt-28">
        {children}
      </main>
    </div>
  );
}
