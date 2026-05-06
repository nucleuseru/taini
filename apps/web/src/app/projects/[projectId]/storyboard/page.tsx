import { Navbar } from "@/components/navbar";
import { Suspense } from "react";
import { ProjectTabs, ProjectTabsSkeleton } from "../_components/project-tabs";
import { StoryboardContainer } from "./_components/storyboard-container";
import {
  StoryboardNavbarActions,
  StoryboardNavbarActionsSkeleton,
} from "./_components/storyboard-navbar-actions";
import { StoryboardSkeleton } from "./_components/storyboard-skeleton";

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
      <Suspense fallback={<StoryboardSkeleton />}>
        <StoryboardContainer />
      </Suspense>
    </main>
  );
}
