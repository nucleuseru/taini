"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  UploadedAudio,
  UploadedAudioSelector,
} from "@/components/uploaded-audio-selector";
import { cn } from "@/lib/utils";
import { Id } from "@repo/convex/dataModel";
import {
  Loader2Icon,
  MicIcon,
  PlusIcon,
  SparklesIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useAudio } from "./context";
import { VoiceSheet } from "./voice-sheet";

export function AudioGenSpace() {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;

  const {
    activeTab,
    setActiveTab,
    text,
    setText,
    voiceName,
    setVoiceName,
    selectedVoice,
    loading,
    isSheetOpen,
    setIsSheetOpen,
    handleGenerate,
    handleClone,
    setSelectedRefAudioId,
    selectedAudio,
  } = useAudio();

  const isPending = loading === "generate" || loading === "clone";

  return (
    <div className="bg-card/80 flex flex-col gap-4 rounded-2xl border border-white/5 p-4 shadow-2xl backdrop-blur-2xl">
      <div className="flex flex-col gap-4">
        {activeTab === "clone" && selectedAudio && (
          <div className="animate-in fade-in slide-in-from-top-2 flex flex-wrap items-center gap-3 duration-300">
            <div className="group relative h-[60px] w-full max-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-3">
                <MicIcon size={14} className="text-muted-foreground" />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-[10px] font-bold tracking-tight text-white/90">
                    {selectedAudio.title ?? "Reference Audio"}
                  </span>
                  <span className="text-[8px] font-medium tracking-tighter text-white/40 uppercase">
                    Reference
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRefAudioId(null);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <XIcon size={14} className="text-white" />
              </button>
            </div>
            <div className="mx-1 h-10 w-px bg-white/5" />
          </div>
        )}

        <div className="group relative">
          {activeTab === "tts" ? (
            <Textarea
              value={text}
              disabled={isPending}
              onChange={(e) => {
                setText(e.target.value);
              }}
              placeholder="Describe the speech or type the script..."
              className="bg-muted min-h-[120px] w-full resize-none rounded-xl border-none p-4 pb-10 text-sm leading-relaxed transition-all focus-visible:ring-1 focus-visible:ring-white/10"
            />
          ) : (
            <div className="bg-muted flex min-h-[120px] w-full flex-col rounded-xl p-4">
              <input
                type="text"
                value={voiceName}
                disabled={isPending}
                onChange={(e) => {
                  setVoiceName(e.target.value);
                }}
                placeholder="Name the voice (e.g. Scarlett)..."
                className="w-full border-none bg-transparent p-0 text-sm font-medium transition-all outline-none focus:ring-0"
              />
              <div className="text-muted-foreground mt-2 text-xs opacity-50">
                Clone a voice using the reference audio below.
              </div>
            </div>
          )}

          <div className="absolute right-2 bottom-2">
            <Button
              size="icon"
              disabled={
                isPending ||
                (activeTab === "tts" ? !text.trim() : !voiceName.trim())
              }
              onClick={() => {
                if (activeTab === "tts") void handleGenerate();
                else void handleClone();
              }}
              className="h-8 w-8 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              {isPending ? (
                <Loader2Icon size={14} className="animate-spin" />
              ) : (
                <SparklesIcon size={14} />
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-white/5 sm:gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex rounded-lg p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-4 text-[10px] font-bold tracking-widest uppercase transition-all",
                  activeTab === "tts"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white",
                )}
                onClick={() => {
                  setActiveTab("tts");
                }}
              >
                Speech
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-4 text-[10px] font-bold tracking-widest uppercase transition-all",
                  activeTab === "clone"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white",
                )}
                onClick={() => {
                  setActiveTab("clone");
                }}
              >
                Clone
              </Button>
            </div>

            <div className="hidden h-6 w-px bg-white/10 sm:block" />

            <div className="flex items-center gap-2">
              {activeTab === "tts" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 rounded-lg border border-dashed px-3 text-[9px] font-bold tracking-widest uppercase transition-all",
                    selectedVoice
                      ? "border-white/20 bg-white/10 text-white"
                      : "text-muted-foreground border-white/10 bg-white/5 hover:bg-white/10 hover:text-white",
                  )}
                  onClick={() => {
                    setIsSheetOpen(true);
                  }}
                >
                  <UserIcon size={12} className="mr-2" />
                  {selectedVoice ? selectedVoice.name : "Select Voice"}
                </Button>
              ) : (
                <UploadedAudioSelector
                  projectId={projectId}
                  selectedAudios={
                    selectedAudio ? [selectedAudio as UploadedAudio] : []
                  }
                  onSelect={(audios: UploadedAudio[]) => {
                    setSelectedRefAudioId(audios[0]?._id ?? null);
                  }}
                  maxSelection={1}
                  label="Select Reference"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 rounded-lg border border-dashed px-3 text-[9px] font-bold tracking-widest uppercase transition-all",
                      selectedAudio
                        ? "border-white/20 bg-white/10 text-white"
                        : "text-muted-foreground border-white/10 bg-white/5 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <PlusIcon size={12} className="mr-2" />
                    Reference
                  </Button>
                </UploadedAudioSelector>
              )}
            </div>
          </div>
        </div>
      </div>

      <VoiceSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
