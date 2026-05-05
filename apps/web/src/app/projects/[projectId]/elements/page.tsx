import { Navbar } from "@/components/navbar";
import { Suspense } from "react";
import { ProjectTabs, ProjectTabsSkeleton } from "../_components/project-tabs";
import { CreateElementModal } from "./_components/create-element-modal";
import {
  ElementsFeed,
  ElementsFeedSkeleton,
} from "./_components/elements-feed";

export default function ElementsPage() {
  return (
    <>
      <Navbar
        CenterComponent={
          <Suspense fallback={<ProjectTabsSkeleton />}>
            <ProjectTabs />
          </Suspense>
        }
      />
      <main className="flex min-h-full w-full flex-col items-center pb-24">
        <Suspense fallback={<ElementsFeedSkeleton />}>
          <ElementsFeed />
        </Suspense>

        <Suspense>
          <CreateElementModal />
        </Suspense>
      </main>
    </>
  );
}
