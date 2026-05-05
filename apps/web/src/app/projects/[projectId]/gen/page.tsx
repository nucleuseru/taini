import { Navbar } from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { ProjectTabs, ProjectTabsSkeleton } from "../_components/project-tabs";
import { GenSpace } from "./_components/gen-space";
import { MediaFeed, MediaFeedSkeleton } from "./_components/media-feed";

export default function GenPage() {
  return (
    <main className="min-h-full pt-16 pb-[400px]">
      <Navbar
        CenterComponent={
          <Suspense fallback={<ProjectTabsSkeleton />}>
            <ProjectTabs />
          </Suspense>
        }
      />
      <Suspense fallback={<MediaFeedSkeleton />}>
        <MediaFeed />
      </Suspense>

      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-40 h-96 bg-linear-to-t from-black via-black/80 to-transparent" />
      <div className="fixed bottom-8 left-1/2 z-50 w-full max-w-[800px] -translate-x-1/2 px-4">
        <Suspense fallback={<Skeleton className="h-[184px]" />}>
          <GenSpace />
        </Suspense>
      </div>
    </main>
  );
}
