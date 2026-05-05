"use client";

import { AudioPlayerButton } from "@/components/ui/audio-player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { convertToWav } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Loader2, MusicIcon, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export type UploadedAudio = Doc<"audio"> & {
  uploaded: true;
  url?: string | null;
};

export interface UploadedAudioSelectorProps {
  label?: string;
  maxSelection?: number;
  projectId: Id<"project">;
  children: React.ReactNode;
  selectedAudios: UploadedAudio[];
  onSelect: (audios: UploadedAudio[]) => void;
}

export function UploadedAudioSelector({
  projectId,
  selectedAudios: selectedItems,
  onSelect,
  maxSelection = 1,
  label = "Select Audio",
  children,
}: UploadedAudioSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAudio = useMutation(api.audio.upload);
  const generateUploadUrl = useMutation(api.upload.generateUrl);

  const { results: audios, status } = usePaginatedQuery(
    api.audio.list,
    { projectId, uploaded: true },
    { initialNumItems: 50 },
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!pendingFile) return;

    try {
      setIsUploading(true);

      // Convert to WAV
      const wavBlob = await convertToWav(pendingFile);
      const wavFile = new File(
        [wavBlob],
        title.trim()
          ? title.trim() + ".wav"
          : pendingFile.name.replace(/\.[^/.]+$/, "") + ".wav",
        {
          type: "audio/wav",
        },
      );

      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": wavFile.type },
        body: wavFile,
      });

      const { storageId } = (await result.json()) as {
        storageId: Id<"_storage">;
      };

      await uploadAudio({
        storageId,
        projectId,
        title: wavFile.name,
      });

      toast.success("Audio uploaded successfully");
      setPendingFile(null);
      setTitle("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload audio");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleSelection = (id: Id<"audio">) => {
    if (selectedItems.find((audio) => audio._id === id)) {
      onSelect(selectedItems.filter((audio) => audio._id !== id));
    } else {
      if (maxSelection === 1) {
        onSelect([audios.find((audio) => audio._id === id) as UploadedAudio]);
        setOpen(false);
      } else if (selectedItems.length < maxSelection) {
        onSelect([
          ...selectedItems,
          audios.find((audio) => audio._id === id) as UploadedAudio,
        ]);
      } else {
        toast.error(
          `You can only select up to ${maxSelection.toString()} audio files`,
        );
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="bg-card border-border w-80 p-0 shadow-2xl"
        align="start"
      >
        <div className="border-border bg-muted/20 flex items-center justify-between border-b p-3">
          <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {label}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] tracking-wider uppercase"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 size={12} className="mr-1 animate-spin" />
            ) : (
              <Plus size={12} className="mr-1" />
            )}
            Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".mp3,.wav,.ogg,.m4a,.flac,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/flac"
            onChange={handleFileSelect}
          />
        </div>

        {pendingFile && (
          <div className="border-border bg-muted/10 flex flex-col gap-2 border-b p-3">
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-[10px] font-medium tracking-tight uppercase">
                Audio Title
              </label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                placeholder="Enter title..."
                className="h-8 text-xs"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleUpload();
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 flex-1 text-[10px] tracking-wider uppercase"
                onClick={() => {
                  setPendingFile(null);
                  setTitle("");
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 flex-1 text-[10px] tracking-wider uppercase"
                onClick={() => void handleUpload()}
                disabled={isUploading || !title.trim()}
              >
                {isUploading ? (
                  <Loader2 size={12} className="mr-1 animate-spin" />
                ) : (
                  <Plus size={12} className="mr-1" />
                )}
                Confirm
              </Button>
            </div>
          </div>
        )}

        <ScrollArea className="h-64 p-2">
          {status === "LoadingFirstPage" ? (
            <div className="flex h-full items-center justify-center p-8">
              <Loader2 className="text-muted-foreground animate-spin" />
            </div>
          ) : audios.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MusicIcon
                className="text-muted-foreground mb-2 opacity-20"
                size={32}
              />
              <p className="text-muted-foreground text-xs">
                No audio uploaded yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {audios.map((audio) => (
                <div
                  key={audio._id}
                  onClick={() => {
                    toggleSelection(audio._id);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md p-2 text-left transition-all",
                    selectedItems.find((item) => item._id === audio._id)
                      ? "bg-primary/10 ring-primary/20 ring-1"
                      : "hover:bg-muted",
                  )}
                >
                  <AudioPlayerButton
                    item={{ id: audio._id, src: audio.url ?? "" }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-xs font-medium">
                      {audio.title ?? "Untitled"}
                    </span>
                    <span className="text-muted-foreground text-[10px] uppercase">
                      {new Date(audio._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
