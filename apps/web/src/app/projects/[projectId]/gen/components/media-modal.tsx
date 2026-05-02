import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { Media } from "./media-feed";

export interface MediaModelProps {
  media: Media;
  onClose: () => void;
}

export function MediaModal({ media, onClose }: MediaModelProps) {
  return (
    <Dialog
      open={!!media}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex h-[80vh] w-[1200px] max-w-[90vw] gap-0 overflow-hidden rounded-md border-none bg-[#131313] p-0 text-[#e5e2e1]"
      >
        <DialogTitle className="sr-only">Media Preview</DialogTitle>
        <div className="relative flex flex-1 items-center justify-center bg-[#0e0e0e]">
          {media.url ? (
            media.type === "video" ? (
              <video
                src={media.url}
                className="h-full w-full object-contain"
                controls
                autoPlay
                loop
              />
            ) : (
              <Image
                src={media.url}
                alt={media.prompt ?? media.type}
                className="h-full w-full object-contain"
              />
            )
          ) : (
            <div className="animate-pulse text-sm tracking-widest uppercase opacity-50">
              Generating...
            </div>
          )}
        </div>

        <div className="flex w-[320px] flex-col gap-6 overflow-y-auto bg-[#1a1a1a] p-6">
          <div>
            <h2
              className="mb-1 text-lg font-semibold tracking-tight"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Create {media.type === "video" ? "Video" : "Image"}
            </h2>
            <div className="text-[10px] tracking-wider uppercase opacity-50">
              {new Date(media._creationTime).toLocaleString()}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10px] tracking-wider uppercase opacity-50">
              Prompt
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {media.prompt}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] font-semibold tracking-wider uppercase">
            <span className="rounded border border-[#353534] bg-[#2a2a2a] px-2 py-1">
              {media.width}x{media.height}
            </span>
            {media.type === "video" && (
              <>
                <span className="rounded border border-[#353534] bg-[#2a2a2a] px-2 py-1">
                  {media.duration}s
                </span>
                <span className="rounded border border-[#353534] bg-[#2a2a2a] px-2 py-1">
                  {media.frameRate} FPS
                </span>
              </>
            )}
            <span className="rounded border border-[#353534] bg-[#2a2a2a] px-2 py-1">
              Seed: {media.seed}
            </span>
            {media.status && (
              <span className="rounded border border-[#353534] bg-[#2a2a2a] px-2 py-1">
                {media.status}
              </span>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Button
              variant="ghost"
              className="justify-start gap-2 text-[#e5e2e1] hover:bg-[#2a2a2a] hover:text-[#efcb61]"
            >
              <span className="opacity-50">✨</span> Edit
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-[#e5e2e1] hover:bg-[#2a2a2a] hover:text-[#efcb61]"
            >
              <span className="opacity-50">🎬</span> Create video
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-[#e5e2e1] hover:bg-[#2a2a2a] hover:text-[#efcb61]"
            >
              <span className="opacity-50">🖌️</span> Edit with Brush
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-[#e5e2e1] hover:bg-[#2a2a2a] hover:text-[#efcb61]"
            >
              <span className="opacity-50">⬇️</span> Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
