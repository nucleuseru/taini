import { Suspense } from "react";
import {
  AudioContainer,
  AudioContainerSkeleton,
} from "./_components/audio-container";

export default function AudioPage() {
  return (
    <main className="flex min-h-full w-full flex-col items-center pt-16">
      <Suspense fallback={<AudioContainerSkeleton />}>
        <AudioContainer />
      </Suspense>
    </main>
  );
}
