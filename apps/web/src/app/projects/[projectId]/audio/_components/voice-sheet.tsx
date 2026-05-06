"use client";

import { AudioPlayerButton } from "@/components/ui/audio-player";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { MusicIcon, Trash2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export interface VoiceSheetProps {
  open: boolean;
  selectedVoiceId?: Id<"voice"> | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (voice: Doc<"voice">) => void;
}

export function VoiceSheet({
  open,
  onSelect,
  onOpenChange,
  selectedVoiceId,
}: VoiceSheetProps) {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;

  const voices = useQuery(api.voice.list, {
    projectId,
    paginationOpts: { numItems: 100, cursor: null },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Voice Library</SheetTitle>
          <SheetDescription className="sr-only">
            All voice prompts used to generate audio
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100svh-72px)]">
          {voices
            ? voices.page.map((voice) => (
                <VoiceCard
                  key={voice._id}
                  voice={voice}
                  isSelected={selectedVoiceId === voice._id}
                  onSelect={() => {
                    onSelect(voice);
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
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center opacity-50">
              <MusicIcon size={32} className="mb-4 opacity-20" />
              <p className="text-sm">
                No voices found. Clone one to get started.
              </p>
            </div>
          )}
        </ScrollArea>
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
  const removeVoice = useMutation(api.voice.remove);

  const onDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeVoice({ id: voice._id });
      toast.success("Voice removed");
    } catch {
      toast.error("Failed to remove voice");
    }
  };

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-center justify-between border-b border-white/2 px-6 py-3 transition-all duration-200 hover:bg-white/2",
        isSelected && "bg-white/4 px-6.5",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-md bg-white/3 transition-colors group-hover:bg-white/6">
          {voice.url ? (
            <AudioPlayerButton
              variant="ghost"
              size="icon"
              className="h-full w-full rounded-md text-[#e5e2e1] hover:bg-transparent"
              item={{ id: voice._id, src: voice.url }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          ) : (
            <MusicIcon size={16} className="text-muted-foreground opacity-30" />
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium tracking-tight text-[#e5e2e1]/90">
            {voice.name}
          </span>
          <div
            className={cn(
              "text-[9px] font-bold tracking-widest uppercase opacity-40",
              voice.status === "completed" && "text-[#efcb61] opacity-70",
            )}
          >
            {voice.status}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pr-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-red-400"
          onClick={(e) => void onDelete(e)}
        >
          <Trash2Icon size={12} />
        </Button>
      </div>
    </div>
  );
}
