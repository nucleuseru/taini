"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowUpIcon,
  Loader2Icon,
  MicIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";
import {
  cloneVoice,
  generateAudio,
  uploadAudio,
  uploadVoice,
} from "../actions";
import { VoiceSheet } from "./voice-sheet";

export function AudioGenSpace({
  selectedRefAudioId,
  onClearRef,
}: {
  selectedRefAudioId?: Id<"audio"> | null;
  onClearRef?: () => void;
}) {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;

  const [activeTab, setActiveTab] = useState<"tts" | "clone">("tts");
  const [text, setText] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<Id<"voice"> | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const generateUploadUrl = useMutation(api.upload.generateUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedVoice = useQuery(
    api.voice.get,
    selectedVoiceId ? { id: selectedVoiceId } : "skip",
  );
  const selectedAudio = useQuery(
    api.audio.get,
    selectedRefAudioId ? { id: selectedRefAudioId } : "skip",
  );

  const [, action, isPending] = useActionState(async () => {
    if (activeTab === "tts") {
      if (!text.trim())
        return toast.error("Please enter text to convert to audio");
      if (!selectedVoiceId) return toast.error("Please select a voice");

      const res = await generateAudio({
        projectId,
        text,
        title: text.slice(0, 20) + "...",
        referenceVoice: selectedVoiceId,
      });

      if (res.error) return toast.error(res.error);
      setText("");
    } else {
      if (!voiceName.trim())
        return toast.error("Please enter a name for the voice");
      if (!selectedRefAudioId)
        return toast.error("Please select or upload a reference audio");

      const res = await cloneVoice({
        projectId,
        name: voiceName,
        referenceAudio: selectedRefAudioId,
      });

      if (res.error) return toast.error(res.error);
      setVoiceName("");
      onClearRef?.();
    }
  }, null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      if (activeTab === "clone") {
        // First upload it as an audio asset so it can be used as a reference
        const res = await uploadAudio({
          projectId,
          title: `Ref: ${file.name}`,
          storageId,
        });

        if (res.error) throw new Error(res.error);
        toast.success("Reference audio uploaded. You can now clone the voice.");
      } else {
        // Upload as a voice directly (if user wants to skip cloning)
        const res = await uploadVoice({
          projectId,
          name: file.name.split(".")[0],
          storageId,
        });
        if (res.error) throw new Error(res.error);
        toast.success("Voice uploaded successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-card flex flex-col gap-4 rounded-xl p-4 sm:flex-row">
      <div className="flex min-w-[120px] flex-row gap-1 sm:flex-col">
        <Button
          variant="ghost"
          className={cn(
            "text-muted-foreground flex-1 justify-start gap-2 rounded border-none",
            activeTab === "tts" && "bg-muted text-[#e5e2e1]",
          )}
          onClick={() => {
            setActiveTab("tts");
          }}
        >
          <MicIcon size={16} />
          <span>TTS</span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "text-muted-foreground flex-1 justify-start gap-2 rounded border-none",
            activeTab === "clone" && "bg-muted text-[#e5e2e1]",
          )}
          onClick={() => {
            setActiveTab("clone");
          }}
        >
          <UserIcon size={16} />
          <span>Clone</span>
        </Button>
      </div>

      <form action={action} className="flex w-full flex-col gap-4">
        {activeTab === "tts" ? (
          <Textarea
            value={text}
            disabled={isPending}
            onChange={(e) => {
              setText(e.target.value);
            }}
            placeholder="Type something to convert to speech..."
            className="bg-muted h-[100px] resize-none rounded border-none text-sm"
          />
        ) : (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={voiceName}
              onChange={(e) => {
                setVoiceName(e.target.value);
              }}
              placeholder="Voice Name (e.g. Scarlett)"
              className="bg-muted w-full rounded border-none px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#efcb61]"
            />
            <div className="text-muted-foreground text-xs">
              Select a reference audio from the grid above or upload a new one.
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 text-zinc-400 **:text-xs sm:gap-3">
          {activeTab === "tts" ? (
            <Button
              type="button"
              variant="ghost"
              className="bg-muted text-muted-foreground h-9 gap-2 border-none px-3"
              onClick={() => {
                setIsSheetOpen(true);
              }}
            >
              <UserIcon size={14} />
              {selectedVoice ? selectedVoice.name : "Select Voice"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="bg-muted text-muted-foreground h-9 gap-2 border-none px-3"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2Icon size={14} className="animate-spin" />
              ) : (
                <UploadIcon size={14} />
              )}
              Upload Reference
            </Button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />

          <Button
            size="icon"
            disabled={isPending || isUploading}
            className="h-9 w-9"
          >
            {isPending ? (
              <Loader2Icon size={16} className="animate-spin" />
            ) : (
              <ArrowUpIcon size={16} />
            )}
          </Button>
        </div>
      </form>

      <VoiceSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedVoiceId={selectedVoiceId ?? undefined}
        onSelect={setSelectedVoiceId}
      />
    </div>
  );
}
