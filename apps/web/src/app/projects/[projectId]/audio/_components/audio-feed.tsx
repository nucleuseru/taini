"use client";

import { CopyableText } from "@/components/copyable-text";
import {
  AudioPlayerButton,
  AudioPlayerDuration,
  AudioPlayerProgress,
  AudioPlayerTime,
} from "@/components/ui/audio-player";
import { Button } from "@/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogTitle,
} from "@/components/ui/drawer-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { useMutation, usePaginatedQuery } from "convex/react";
import {
  DownloadIcon,
  Loader2Icon,
  MusicIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export type AudioAsset = Doc<"audio"> & { url?: string | null };

export function AudioFeed() {
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

  if (audios.results.length === 0) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center py-20 text-center">
        <div className="bg-muted mb-6 flex h-20 w-20 items-center justify-center rounded-3xl opacity-20">
          <MusicIcon size={40} />
        </div>
        <h3 className="font-headline text-xl font-semibold tracking-tight text-[#e5e2e1]">
          No audio yet
        </h3>
        <p className="text-muted-foreground mt-2 max-w-xs text-sm opacity-50">
          Start by generating some speech or cloning a voice using the form
          below.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
        {audios.results.map((audio) => (
          <AudioCard
            key={audio._id}
            audio={audio}
            onClick={() => {
              setSelectedAudio(audio);
            }}
          />
        ))}
      </div>

      <AudioDetailsDrawer
        audio={selectedAudio}
        onOpenChange={(open) => !open && setSelectedAudio(null)}
      />
    </>
  );
}

function AudioCard({
  audio,
  onClick,
}: {
  audio: AudioAsset;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 p-4 transition-all hover:scale-[1.02] hover:bg-white/5",
        (audio.ttsStatus === "generating" ||
          audio.sttStatus === "generating") &&
          "animate-pulse",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 overflow-hidden">
          <h3 className="truncate text-sm font-semibold tracking-tight text-[#e5e2e1]">
            {audio.title ?? "Untitled Audio"}
          </h3>
          <span className="text-muted-foreground text-[10px] opacity-50">
            {new Date(audio._creationTime).toLocaleDateString()}
          </span>
        </div>

        {audio.url && (
          <AudioPlayerButton
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
            item={{ id: audio._id, src: audio.url }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        )}
      </div>

      <div className="text-muted-foreground mt-4 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase opacity-40">
        <div className="flex items-center gap-2">
          {audio.ttsStatus === "completed" ? (
            <span className="text-[#efcb61]">Generated</span>
          ) : (
            <span>{audio.ttsStatus || "Uploaded"}</span>
          )}
        </div>
        {audio.url && (
          <div className="flex items-center gap-1">
            <MusicIcon size={10} />
            <span>Audio</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AudioDetailsDrawer({
  audio,
  onOpenChange,
}: {
  audio: AudioAsset | null;
  onOpenChange: (open: boolean) => void;
}) {
  const removeAudio = useMutation(api.audio.remove);
  const triggerInference = useMutation(api.audio.triggerInference);
  const [isTriggering, setIsTriggering] = useState(false);

  const onDelete = async () => {
    if (!audio) return;
    try {
      await removeAudio({ id: audio._id });
      toast.success("Audio removed");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to remove audio");
    }
  };

  const onTrigger = async () => {
    if (!audio) return;
    setIsTriggering(true);
    try {
      await triggerInference({ id: audio._id });
      toast.success("Inference triggered");
    } catch (error) {
      toast.error("Failed to trigger inference");
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <DrawerDialog open={!!audio} onOpenChange={onOpenChange}>
      <DrawerDialogContent className="max-w-2xl border-none bg-[#1a1a1a] p-0 text-[#e5e2e1]">
        {audio && (
          <div className="flex flex-col">
            <div className="p-6 pb-0">
              <DrawerDialogTitle className="font-headline text-2xl font-bold tracking-tight">
                {audio.title ?? "Audio Details"}
              </DrawerDialogTitle>
              <DrawerDialogDescription className="text-muted-foreground mt-1 text-sm opacity-50">
                Created on {new Date(audio._creationTime).toLocaleString()}
              </DrawerDialogDescription>
            </div>

            <div className="p-6">
              {audio.url ? (
                <div className="bg-muted/50 mb-8 flex flex-col gap-4 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <AudioPlayerButton
                      variant="default"
                      size="icon"
                      className="h-12 w-12 rounded-full shadow-xl"
                      item={{ id: audio._id, src: audio.url }}
                    />
                    <div className="flex flex-1 flex-col gap-1">
                      <AudioPlayerProgress className="w-full" />
                      <div className="flex items-center justify-between px-1">
                        <AudioPlayerTime className="text-[10px]" />
                        <AudioPlayerDuration className="text-[10px]" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-muted mb-8 flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 opacity-50">
                  <MusicIcon size={32} className="mb-2 opacity-20" />
                  <span className="text-xs">Processing audio...</span>
                </div>
              )}

              {audio.text && (
                <div className="mb-8 flex flex-col gap-2">
                  <h4 className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase opacity-50">
                    Transcript / Text
                  </h4>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <CopyableText
                      text={audio.text}
                      className="text-sm leading-relaxed"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex gap-2">
                  {audio.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 rounded-lg border-white/10 bg-white/5 px-4 text-xs font-medium hover:bg-white/10"
                      asChild
                    >
                      <a href={audio.url} download={audio.title ?? "audio"}>
                        <DownloadIcon size={14} />
                        Download
                      </a>
                    </Button>
                  )}
                  {!audio.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 rounded-lg border-white/10 bg-white/5 px-4 text-xs font-medium hover:bg-white/10"
                      disabled={isTriggering}
                      onClick={onTrigger}
                    >
                      {isTriggering ? (
                        <Loader2Icon size={14} className="animate-spin" />
                      ) : (
                        <SparklesIcon size={14} />
                      )}
                      Trigger Inference
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 rounded-lg text-red-400/60 hover:bg-red-500/10 hover:text-red-400"
                  onClick={onDelete}
                >
                  <Trash2Icon size={14} />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </DrawerDialogContent>
    </DrawerDialog>
  );
}

export function AudioFeedSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="bg-card h-32 rounded-2xl" />
      ))}
    </div>
  );
}
