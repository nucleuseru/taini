import { Navbar } from "@/components/navbar";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { ProjectTabs, ProjectTabsSkeleton } from "../_components/project-tabs";
import { StoryboardContainer } from "./_components/storyboard-container";

export default function StoryboardPage() {
  return (
    <>
      <Navbar
        CenterComponent={
          <Suspense fallback={<ProjectTabsSkeleton />}>
            <ProjectTabs />
          </Suspense>
        }
      />
      <main className="flex h-full w-full flex-col p-6">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          }
        >
          <StoryboardContainer />
        </Suspense>
      </main>
    </>
  );
}
