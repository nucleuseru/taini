"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { usePaginatedQuery } from "convex/react";
import { MusicIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AudioModal } from "./audio-modal";

export type AudioAsset = Doc<"audio"> & { url?: string | null };

export function AudioFeed() {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const [selectedAudio, setSelectedAudio] = useState<AudioAsset | null>(null);

  const audios = usePaginatedQuery(
    api.audio.list,
    { projectId, uploaded: false },
    { initialNumItems: 1024 },
  );

  if (audios.status === "LoadingFirstPage") {
    return <AudioFeedSkeleton />;
  }

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
        {audios.results.map((audio) => (
          <div
            key={audio._id}
            onClick={() => {
              setSelectedAudio(audio);
            }}
            className={cn(
              "bg-card relative flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md p-6 transition-transform hover:scale-[1.02]",
              (audio.ttsStatus === "generating" ||
                audio.sttStatus === "generating") &&
                "bg-background",
            )}
          >
            {audio.url ? (
              <MusicIcon
                size={32}
                className="text-muted-foreground opacity-20"
              />
            ) : (
              (audio.ttsStatus === "generating" ||
                audio.sttStatus === "generating") && (
                <Skeleton className="bg-card h-full w-full" />
              )
            )}

            <div className="mt-4 w-full px-2">
              <div className="truncate text-sm font-medium text-[#e5e2e1]">
                {audio.title ?? "Untitled Audio"}
              </div>
              <div className="text-muted-foreground truncate text-[10px] tracking-tight uppercase opacity-50">
                {audio.text ?? "No description"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedAudio && (
        <AudioModal
          audio={selectedAudio}
          onClose={() => {
            setSelectedAudio(null);
          }}
        />
      )}
    </>
  );
}

export function AudioFeedSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="bg-card aspect-video rounded-md" />
      ))}
    </div>
  );
}
