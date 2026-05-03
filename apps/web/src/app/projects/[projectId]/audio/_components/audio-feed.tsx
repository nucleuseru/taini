"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { usePaginatedQuery } from "convex/react";
import { ClockIcon, MusicIcon, PauseIcon, PlayIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AudioModal } from "./audio-modal";

export type AudioAsset = Doc<"audio"> & { url?: string | null };

export function AudioFeed({
  onSelectAsRef,
  selectedRefId,
}: {
  onSelectAsRef?: (id: Id<"audio">) => void;
  selectedRefId?: Id<"audio">;
}) {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const [selectedAudio, setSelectedAudio] = useState<AudioAsset | null>(null);

  const audios = usePaginatedQuery(
    api.audio.list,
    { projectId },
    { initialNumItems: 1024 },
  );

  if (audios.status === "LoadingFirstPage") {
    return <AudioFeedSkeleton />;
  }

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
        {audios.results.map((audio) => (
          <AudioCard
            key={audio._id}
            audio={audio}
            isSelected={selectedRefId === audio._id}
            onClick={() => {
              if (onSelectAsRef) {
                onSelectAsRef(audio._id);
              } else {
                setSelectedAudio(audio);
              }
            }}
            onViewDetails={() => {
              setSelectedAudio(audio);
            }}
          />
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

function AudioCard({
  audio,
  onClick,
  isSelected,
  onViewDetails,
}: {
  audio: AudioAsset;
  onClick: () => void;
  isSelected?: boolean;
  onViewDetails: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audio.url) return;

    if (!audioElement) {
      const el = new Audio(audio.url);
      el.onended = () => {
        setIsPlaying(false);
      };
      el.play();
      setAudioElement(el);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div
      className={cn(
        "group bg-card relative cursor-pointer overflow-hidden rounded-md p-4 transition-all hover:scale-[1.02]",
        isSelected && "ring-2 ring-[#efcb61]",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-sm">
          <MusicIcon size={20} className="text-muted-foreground" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-medium text-[#e5e2e1]">
            {audio.title ?? "Untitled Audio"}
          </span>
          <span className="text-muted-foreground truncate text-xs">
            {audio.text ?? "No text description"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {audio.ttsStatus && (
            <span className="rounded-sm border border-[#353534] bg-[#131313]/80 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#e5e2e1] uppercase">
              TTS: {audio.ttsStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            <ClockIcon size={14} className="opacity-50" />
          </Button>
          {audio.url && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              onClick={togglePlay}
            >
              {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AudioFeedSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="bg-card h-32 w-full rounded-md" />
      ))}
    </div>
  );
}
