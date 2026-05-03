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

      <main className="mx-auto w-full max-w-screen-2xl flex-1 p-6">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
