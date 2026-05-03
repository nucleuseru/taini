import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadIcon, MusicIcon } from "lucide-react";
import { AudioAsset } from "./audio-feed";

export interface AudioModalProps {
  audio: AudioAsset;
  onClose: () => void;
}

export function AudioModal({ audio, onClose }: AudioModalProps) {
  return (
    <Dialog
      open={!!audio}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex h-[80vh] w-[1200px]! max-w-[90vw]! flex-col gap-0 overflow-hidden rounded-md border-none p-0 text-[#e5e2e1] md:flex-row"
      >
        <DialogTitle className="sr-only">Audio Preview</DialogTitle>
        <div className="relative flex h-full w-full flex-1 items-center justify-center bg-[#131313] p-12">
          {audio.url ? (
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="bg-muted flex h-32 w-32 items-center justify-center rounded-sm">
                <MusicIcon size={64} className="text-muted-foreground" />
              </div>
              <audio
                src={audio.url}
                className="w-full max-w-md"
                controls
                autoPlay
              />
            </div>
          ) : (
            (audio.ttsStatus === "generating" ||
              audio.sttStatus === "generating") && (
              <Skeleton className="h-full w-full bg-[#0e0e0e]" />
            )
          )}
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto bg-[#1a1a1a] p-6 md:w-[400px]">
          <div>
            <h2 className="font-headline mb-1 text-lg font-semibold tracking-tight">
              {audio.title || "Untitled Audio"}
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
              <div className="bg-muted rounded-sm p-4">
                <p className="text-sm leading-relaxed">{audio.text}</p>
              </div>
            </div>
          )}

          {audio.timestamps && audio.timestamps.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] tracking-wider uppercase opacity-50">
                Timestamps
              </div>
              <div className="flex flex-col gap-2">
                {audio.timestamps.map((ts, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="text-muted-foreground font-mono">
                      [{ts.start.toFixed(2)}s - {ts.end.toFixed(2)}s]
                    </span>
                    <span>{ts.text}</span>
                  </div>
                ))}
              </div>
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
            {audio.url && (
              <Button
                className="justify-start gap-2 text-[#e5e2e1] hover:bg-[#2a2a2a] hover:text-[#efcb61]"
                variant="ghost"
                asChild
              >
                <a
                  href={audio.url}
                  download={audio.title || `audio-${audio._id}`}
                >
                  <DownloadIcon size={16} className="opacity-50" /> Download
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
