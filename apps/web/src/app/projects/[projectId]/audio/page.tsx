import { Suspense } from "react";
import {
  AudioContainer,
  AudioContainerSkeleton,
} from "./_components/audio-container";

export default function AudioPage() {
  return (
    <main className="flex min-h-full w-full flex-col items-center pb-[400px]">
      <Suspense fallback={<AudioContainerSkeleton />}>
        <AudioContainer />
      </Suspense>

      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-40 h-96 bg-linear-to-t from-black via-black/80 to-transparent" />
    </main>
  );
}
