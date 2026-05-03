"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  Loader2Icon,
  MicIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react";
import { useAudio } from "./context";
import { VoiceSheet } from "./voice-sheet";

export function AudioGenSpace() {
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
    handleFileUpload,
    fileInputRef,
  } = useAudio();

  const isPending = loading === "generate" || loading === "clone";
  const isUploading = loading === "upload-audio" || loading === "upload-voice";

  return (
    <div className="bg-card flex flex-col gap-4 rounded-xl p-4 shadow-2xl ring-1 ring-white/5 sm:flex-row">
      <div className="flex min-w-[120px] flex-row gap-1 sm:flex-col">
        <Button
          variant="ghost"
          className={cn(
            "text-muted-foreground flex-1 justify-start gap-2 rounded-lg border-none transition-all duration-200",
            activeTab === "tts" && "bg-muted text-[#e5e2e1] shadow-sm",
          )}
          onClick={() => {
            setActiveTab("tts");
          }}
        >
          <MicIcon
            size={16}
            className={cn(activeTab === "tts" && "text-[#efcb61]")}
          />
          <span className="text-sm font-medium">TTS</span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "text-muted-foreground flex-1 justify-start gap-2 rounded-lg border-none transition-all duration-200",
            activeTab === "clone" && "bg-muted text-[#e5e2e1] shadow-sm",
          )}
          onClick={() => {
            setActiveTab("clone");
          }}
        >
          <UserIcon
            size={16}
            className={cn(activeTab === "clone" && "text-[#efcb61]")}
          />
          <span className="text-sm font-medium">Clone</span>
        </Button>
      </div>

      <div className="flex w-full flex-col gap-4">
        {activeTab === "tts" ? (
          <Textarea
            value={text}
            disabled={isPending}
            onChange={(e) => {
              setText(e.target.value);
            }}
            placeholder="Type something to convert to speech..."
            className="bg-muted min-h-[100px] resize-none rounded-lg border-none text-sm transition-all focus:ring-1 focus:ring-white/10"
          />
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={voiceName}
              disabled={isPending}
              onChange={(e) => {
                setVoiceName(e.target.value);
              }}
              placeholder="Voice Name (e.g. Scarlett)"
              className="bg-muted w-full rounded-lg border-none px-4 py-3 text-sm transition-all outline-none focus:ring-1 focus:ring-[#efcb61]/50"
            />
            <div className="text-muted-foreground px-1 text-xs leading-relaxed opacity-70">
              Select a reference audio from the library above or upload a sample
              to clone a new voice.
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {activeTab === "tts" ? (
            <Button
              type="button"
              variant="ghost"
              className="bg-muted text-muted-foreground h-10 gap-2 rounded-lg border-none px-4 transition-all hover:text-[#e5e2e1]"
              onClick={() => {
                setIsSheetOpen(true);
              }}
            >
              <UserIcon size={14} className="opacity-70" />
              <span className="text-xs font-medium">
                {selectedVoice ? selectedVoice.name : "Select Voice"}
              </span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="bg-muted text-muted-foreground h-10 gap-2 rounded-lg border-none px-4 transition-all hover:text-[#e5e2e1]"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2Icon size={14} className="animate-spin" />
              ) : (
                <UploadIcon size={14} className="opacity-70" />
              )}
              <span className="text-xs font-medium">Upload Reference</span>
            </Button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              void handleFileUpload(e);
            }}
            accept="audio/*"
            className="hidden"
          />

          <Button
            size="icon"
            onClick={() => {
              void (activeTab === "tts" ? handleGenerate() : handleClone());
            }}
            disabled={isPending || isUploading}
            className={cn(
              "h-10 w-10 rounded-lg transition-all duration-300",
              isPending || isUploading
                ? "opacity-50"
                : "shadow-lg shadow-[#efcb61]/10 hover:scale-105 active:scale-95",
            )}
          >
            {isPending ? (
              <Loader2Icon size={18} className="animate-spin" />
            ) : (
              <ArrowUpIcon size={18} />
            )}
          </Button>
        </div>
      </div>

      <VoiceSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
