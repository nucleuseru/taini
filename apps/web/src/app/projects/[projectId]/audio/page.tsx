import { Navbar } from "@/components/navbar";
import { AudioPlayerProvider } from "@/components/ui/audio-player";
import { Suspense } from "react";
import { ProjectTabs, ProjectTabsSkeleton } from "../_components/project-tabs";
import {
  AudioActions,
  AudioActionsSkeleton,
} from "./_components/audio-actions";
import { AudioFeed, AudioFeedSkeleton } from "./_components/audio-feed";

export default function AudioPage() {
  return (
    <main className="min-h-full pt-16 pb-24">
      <Navbar
        CenterComponent={
          <Suspense fallback={<ProjectTabsSkeleton />}>
            <ProjectTabs />
          </Suspense>
        }
        RightComponent={
          <Suspense fallback={<AudioActionsSkeleton />}>
            <AudioActions />
          </Suspense>
        }
      />
      <Suspense fallback={<AudioFeedSkeleton />}>
        <AudioPlayerProvider>
          <Suspense fallback={<AudioFeedSkeleton />}>
            <AudioFeed />
          </Suspense>
        </AudioPlayerProvider>
      </Suspense>
    </main>
  );
}
