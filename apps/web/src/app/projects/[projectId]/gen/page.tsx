import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import {
  AsyncMediaFeed,
  MediaFeedSkeleton,
} from "./_components/async-media-feed";
import { GenSpace } from "./_components/gen-space";

export default function GenPage(props: PageProps<"/projects/[projectId]/gen">) {
  return (
    <main className="flex min-h-full w-full flex-col items-center pt-16">
      <Suspense fallback={<MediaFeedSkeleton />}>
        <AsyncMediaFeed {...props} />
      </Suspense>

      <div className="fixed bottom-8 left-1/2 z-50 w-full max-w-[800px] -translate-x-1/2 px-4">
        <Suspense fallback={<Skeleton className="h-[184px]" />}>
          <GenSpace />
        </Suspense>
      </div>
    </main>
  );
}
