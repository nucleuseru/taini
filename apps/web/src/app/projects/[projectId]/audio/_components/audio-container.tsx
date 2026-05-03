"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@repo/convex/dataModel";
import { Suspense, useState } from "react";
import { AudioFeed, AudioFeedSkeleton } from "./audio-feed";
import { AudioGenSpace } from "./audio-gen-space";

export function AudioContainer() {
  const [selectedRefAudioId, setSelectedRefAudioId] =
    useState<Id<"audio"> | null>(null);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="w-full max-w-[1400px] px-4 pb-48">
        <h1 className="font-headline mb-8 text-3xl font-bold tracking-tight text-[#e5e2e1]">
          Audio Library
        </h1>

        <Suspense fallback={<AudioFeedSkeleton />}>
          <AudioFeed
            onSelectAsRef={(id) => {
              setSelectedRefAudioId(id);
            }}
            selectedRefId={selectedRefAudioId ?? undefined}
          />
        </Suspense>
      </div>

      <div className="fixed bottom-8 left-1/2 z-50 w-full max-w-[800px] -translate-x-1/2 px-4">
        <Suspense fallback={<Skeleton className="h-[184px] rounded-xl" />}>
          <AudioGenSpace
            selectedRefAudioId={selectedRefAudioId}
            onClearRef={() => {
              setSelectedRefAudioId(null);
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
