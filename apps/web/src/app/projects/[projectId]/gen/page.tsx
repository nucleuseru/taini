import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { AsyncMediaFeed } from "./components/async-media-feed";
import { GenSpace } from "./components/gen-space";

export default function GenPage(props: PageProps<"/projects/[projectId]/gen">) {
  return (
    <main className="flex min-h-full w-full flex-col items-center">
      <div className="flex w-full max-w-[1400px] flex-col items-center space-y-8 px-4 pt-16 md:px-8">
        <div className="mt-8 mb-8 space-y-2 text-center">
          <h1 className="font-headline text-[2.5rem] leading-tight font-bold tracking-[-0.02em] text-balance md:text-[3.5rem]">
            Let&apos;s start with some image storming
          </h1>
          <p className="text-sm tracking-widest uppercase opacity-70">
            Try using one of the presets
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center opacity-50">
              Loading media...
            </div>
          }
        >
          <AsyncMediaFeed {...props} />
        </Suspense>
      </div>

      <div className="fixed bottom-8 left-1/2 z-50 w-full max-w-[800px] -translate-x-1/2 px-4">
        <Suspense fallback={<Skeleton className="h-[184px]" />}>
          <GenSpace />
        </Suspense>
      </div>
    </main>
  );
}
