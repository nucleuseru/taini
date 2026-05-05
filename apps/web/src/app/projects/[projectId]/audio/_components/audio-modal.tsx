import { ConfirmDialog } from "@/components/confirm-dialog";
import { CopyableText } from "@/components/copyable-text";
import { Button } from "@/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogTitle,
} from "@/components/ui/drawer-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DownloadIcon,
  MusicIcon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";
import { useState } from "react";
import { AudioAsset } from "./audio-feed";
import { useAudio } from "./context";

export interface AudioModalProps {
  audio: AudioAsset;
  onClose: () => void;
}

export function AudioModal({ audio, onClose }: AudioModalProps) {
  const { selectedRefAudioId, setSelectedRefAudioId, handleRemoveAudio } =
    useAudio();
  const isSelected = selectedRefAudioId === audio._id;
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <DrawerDialog
        open={!!audio}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DrawerDialogContent
          showCloseButton={false}
          className="h-max max-h-[80vh] w-full rounded-md p-0 md:h-full md:max-w-[min(1200px,90vw)]"
        >
          <DrawerDialogTitle className="sr-only">
            Audio Preview
          </DrawerDialogTitle>
          <DrawerDialogDescription className="sr-only">
            Use this to listen to and manage the generated audio.
          </DrawerDialogDescription>

          <ScrollArea className="h-full w-full">
            <div className="flex w-full flex-col md:h-[80vh] md:flex-row">
              <div className="bg-muted flex min-h-[50vw] w-full items-center justify-center p-12 md:min-h-0">
                {audio.url ? (
                  <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
                    <div className="bg-background flex h-32 w-32 items-center justify-center rounded-2xl border border-white/5 shadow-2xl">
                      <MusicIcon
                        size={48}
                        className="text-muted-foreground opacity-20"
                      />
                    </div>
                    <audio
                      src={audio.url}
                      className="w-full"
                      controls
                      autoPlay
                    />
                  </div>
                ) : (
                  (audio.ttsStatus === "generating" ||
                    audio.sttStatus === "generating") && (
                    <Skeleton className="h-full w-full bg-[#131313]" />
                  )
                )}
              </div>

              <div className="bg-card flex flex-col gap-6 overflow-y-auto p-6 md:w-[320px]">
                <div>
                  <h2 className="font-headline mb-1 text-lg font-semibold tracking-tight">
                    {audio.title ?? "Untitled Audio"}
                  </h2>
                  <div className="text-[10px] tracking-wider uppercase opacity-50">
                    {new Date(audio._creationTime).toLocaleString()}
                  </div>
                </div>

                {audio.text && (
                  <div>
                    <div className="mb-2 text-[10px] tracking-wider uppercase opacity-50">
                      Text / Transcription
                    </div>
                    <CopyableText
                      text={audio.text}
                      className="line-clamp-3 text-sm leading-relaxed md:line-clamp-6"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 text-[10px] font-semibold tracking-wider uppercase">
                  {audio.ttsStatus && (
                    <span className="rounded border border-[#353534] bg-[#2a2a2a] px-2 py-1">
                      TTS: {audio.ttsStatus}
                    </span>
                  )}
                  {audio.sttStatus && (
                    <span className="rounded border border-[#353534] bg-[#2a2a2a] px-2 py-1">
                      STT: {audio.sttStatus}
                    </span>
                  )}
                  {audio.uploaded && (
                    <span className="rounded border border-[#353534] bg-[#2a2a2a] px-2 py-1">
                      Uploaded
                    </span>
                  )}
                </div>

                <div className="mt-auto flex flex-col gap-2">
                  <Button
                    className={cn(
                      "justify-start gap-2 text-[#e5e2e1] transition-all",
                      isSelected
                        ? "bg-white/10 text-white"
                        : "hover:bg-white/5 hover:text-white",
                    )}
                    variant="ghost"
                    onClick={() => {
                      setSelectedRefAudioId(isSelected ? null : audio._id);
                    }}
                  >
                    <UserPlusIcon size={14} className="opacity-50" />
                    {isSelected ? "Selected as Ref" : "Select as Ref"}
                  </Button>

                  {audio.url && (
                    <Button
                      className="justify-start gap-2 text-[#e5e2e1] hover:bg-white/5 hover:text-white"
                      variant="ghost"
                      asChild
                    >
                      <a
                        href={audio.url}
                        download={audio.title ?? `audio-${audio._id}`}
                      >
                        <DownloadIcon size={14} className="opacity-50" />{" "}
                        Download
                      </a>
                    </Button>
                  )}

                  <Button
                    className="justify-start gap-2 text-red-400/60 hover:bg-red-500/10 hover:text-red-400"
                    variant="ghost"
                    onClick={() => {
                      setShowConfirm(true);
                    }}
                  >
                    <Trash2Icon size={14} className="opacity-50" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DrawerDialogContent>
      </DrawerDialog>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Delete Audio"
        description="Are you sure you want to delete this audio? This action cannot be undone."
        variant="destructive"
        onConfirm={() => {
          void handleRemoveAudio(audio._id).then(() => {
            onClose();
          });
        }}
      />
    </>
  );
}
