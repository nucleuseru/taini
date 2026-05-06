import { Navbar } from "@/components/navbar";
import { Suspense } from "react";
import { ProjectTabs, ProjectTabsSkeleton } from "../_components/project-tabs";
import {
  ElementActions,
  ElementActionsSkeleton,
} from "./_components/element-actions";
import {
  ElementsFeed,
  ElementsFeedSkeleton,
} from "./_components/elements-feed";

export default function ElementsPage() {
  return (
    <main className="min-h-full pt-16 pb-24">
      <Navbar
        CenterComponent={
          <Suspense fallback={<ProjectTabsSkeleton />}>
            <ProjectTabs />
          </Suspense>
        }
        RightComponent={
          <Suspense fallback={<ElementActionsSkeleton />}>
            <ElementActions />
          </Suspense>
        }
      />
      <Suspense fallback={<ElementsFeedSkeleton />}>
        <ElementsFeed />
      </Suspense>
    </main>
  );
}
