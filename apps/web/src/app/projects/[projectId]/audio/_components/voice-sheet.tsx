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
import { Doc, Id } from "@repo/convex/dataModel";
import { useQuery } from "convex/react";
import { CheckIcon, MusicIcon, PauseIcon, PlayIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export function VoiceSheet({
  open,
  onOpenChange,
  onSelect,
  selectedVoiceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (voiceId: Id<"voice">) => void;
  selectedVoiceId?: Id<"voice">;
}) {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const voices = useQuery(api.voice.list, {
    projectId,
    paginationOpts: { numItems: 100, cursor: null },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] border-none bg-[#1a1a1a] text-[#e5e2e1] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="font-headline text-[#e5e2e1]">
            Voice Clones
          </SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex max-h-[calc(100vh-120px)] flex-col gap-4 overflow-y-auto">
          {voices
            ? voices.page.map((voice) => (
                <VoiceCard
                  key={voice._id}
                  voice={voice}
                  isSelected={selectedVoiceId === voice._id}
                  onSelect={() => {
                    onSelect?.(voice._id);
                    onOpenChange(false);
                  }}
                />
              ))
            : Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-24 w-full rounded-md bg-[#2a2a2a]"
                />
              ))}
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!voice.url) return;

    if (!audioElement) {
      const el = new Audio(voice.url);
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
        "group relative cursor-pointer overflow-hidden rounded-md bg-[#2a2a2a] p-4 transition-all hover:bg-[#353534]",
        isSelected && "ring-1 ring-[#efcb61]",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#131313]">
            <MusicIcon size={16} className="text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#e5e2e1]">
              {voice.name}
            </span>
            <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
              {voice.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {voice.url && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-[#131313]"
              onClick={togglePlay}
            >
              {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
            </Button>
          )}
          {isSelected && <CheckIcon size={16} className="text-[#efcb61]" />}
        </div>
      </div>
    </div>
  );
}
