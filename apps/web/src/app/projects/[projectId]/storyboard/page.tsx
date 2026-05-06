import { Navbar } from "@/components/navbar";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { ProjectTabs, ProjectTabsSkeleton } from "../_components/project-tabs";
import { StoryboardContainer } from "./_components/storyboard-container";
import {
  StoryboardNavbarActions,
  StoryboardNavbarActionsSkeleton,
} from "./_components/storyboard-navbar-actions";

export default function StoryboardPage() {
  return (
    <main className="min-h-full pt-16 pb-24">
      <Navbar
        CenterComponent={
          <Suspense fallback={<ProjectTabsSkeleton />}>
            <ProjectTabs />
          </Suspense>
        }
        RightComponent={
          <Suspense fallback={<StoryboardNavbarActionsSkeleton />}>
            <StoryboardNavbarActions />
          </Suspense>
        }
      />
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
  );
}
