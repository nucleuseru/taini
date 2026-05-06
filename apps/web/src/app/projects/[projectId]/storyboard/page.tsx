import { Navbar } from "@/components/navbar";
import { Suspense } from "react";
import { ProjectTabs, ProjectTabsSkeleton } from "../_components/project-tabs";
import {
  StoryboardContainer,
  StoryboardSkeleton,
} from "./_components/storyboard-container";
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
      <Suspense fallback={<StoryboardSkeleton />}>
        <StoryboardContainer />
      </Suspense>
    </main>
  );
}
