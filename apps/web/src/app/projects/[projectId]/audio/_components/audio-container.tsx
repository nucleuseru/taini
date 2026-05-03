"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { AudioFeed, AudioFeedSkeleton } from "./audio-feed";
import { AudioGenSpace } from "./audio-gen-space";
import { AudioProvider } from "./context";

export function AudioContainer() {
  return (
    <AudioProvider>
      <div className="flex w-full flex-col items-center">
        <div className="w-full max-w-[1400px] px-4 pb-48">
          <h1 className="font-headline mb-8 text-3xl font-bold tracking-tight text-[#e5e2e1]">
            Audio Library
          </h1>

          <Suspense fallback={<AudioFeedSkeleton />}>
            <AudioFeed />
          </Suspense>
        </div>

        <div className="fixed bottom-8 left-1/2 z-50 w-full max-w-[800px] -translate-x-1/2 px-4">
          <Suspense fallback={<Skeleton className="h-[184px] rounded-xl" />}>
            <AudioGenSpace />
          </Suspense>
        </div>
      </div>
    </AudioProvider>
  );
}
export function AudioContainerSkeleton() {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="w-full max-w-[1400px] px-4 pb-48">
        <h1 className="font-headline mb-8 text-3xl font-bold tracking-tight text-[#e5e2e1]">
          Audio Library
        </h1>
        <AudioFeedSkeleton />
      </div>

      <div className="fixed bottom-8 left-1/2 z-50 w-full max-w-[800px] -translate-x-1/2 px-4">
        <Skeleton className="h-[184px] rounded-xl" />
      </div>
    </div>
  );
}
