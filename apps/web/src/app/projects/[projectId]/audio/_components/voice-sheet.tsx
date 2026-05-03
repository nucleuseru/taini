"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@repo/convex/api";
import { Doc } from "@repo/convex/dataModel";
import { useQuery } from "convex/react";
import {
  CheckIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { useAudio } from "./context";

export function VoiceSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { projectId, selectedVoiceId, setSelectedVoiceId } = useAudio();
  const voices = useQuery(api.voice.list, {
    projectId,
    paginationOpts: { numItems: 100, cursor: null },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] border-none bg-[#1a1a1a] text-[#e5e2e1] shadow-2xl sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl tracking-tight text-[#e5e2e1]">
            Voice Library
          </SheetTitle>
        </SheetHeader>
        <div className="custom-scrollbar mt-8 flex max-h-[calc(100vh-120px)] flex-col gap-3 overflow-y-auto pr-2">
          {voices
            ? voices.page.map((voice) => (
                <VoiceCard
                  key={voice._id}
                  voice={voice}
                  isSelected={selectedVoiceId === voice._id}
                  onSelect={() => {
                    setSelectedVoiceId(voice._id);
                    onOpenChange(false);
                  }}
                />
              ))
            : Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-full rounded-lg bg-[#2a2a2a]/50"
                />
              ))}

          {voices?.page.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
              <MusicIcon size={32} className="mb-4 opacity-20" />
              <p className="text-sm">
                No voices found. Clone one to get started.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function VoiceCard({
  voice,
  isSelected,
  onSelect,
}: {
  voice: Doc<"voice"> & { url?: string | null };
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { handleRemoveVoice, loading } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );

  const isRemoving = loading === "remove-voice";

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!voice.url) return;

    if (!audioElement) {
      const el = new Audio(voice.url);
      el.onended = () => {
        setIsPlaying(false);
      };
      void el.play();
      setAudioElement(el);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        void audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    void handleRemoveVoice(voice._id);
  };

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-center justify-between rounded-lg bg-[#242423] p-3 transition-all duration-200 hover:bg-[#2a2a29]",
        isSelected && "bg-[#2a2a29] ring-1 ring-[#efcb61]",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-[#131313] shadow-inner transition-transform group-hover:scale-105">
          {voice.url ? (
            <Button
              size="icon"
              variant="ghost"
              className="h-full w-full rounded-lg text-[#e5e2e1] hover:bg-transparent"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <PauseIcon size={20} fill="currentColor" />
              ) : (
                <PlayIcon size={20} fill="currentColor" className="ml-1" />
              )}
            </Button>
          ) : (
            <MusicIcon size={20} className="text-muted-foreground opacity-50" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-[#e5e2e1]">
            {voice.name}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold tracking-widest uppercase",
              voice.status === "completed"
                ? "text-[#efcb61]/70"
                : "text-muted-foreground opacity-50",
            )}
          >
            {voice.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {isSelected && (
          <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#efcb61]/10">
            <CheckIcon size={14} className="text-[#efcb61]" />
          </div>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="text-muted-foreground h-8 w-8 rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
          disabled={isRemoving}
          onClick={onDelete}
        >
          <Trash2Icon size={14} />
        </Button>
      </div>
    </div>
  );
}
