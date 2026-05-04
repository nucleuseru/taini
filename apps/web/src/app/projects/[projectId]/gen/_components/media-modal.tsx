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
import Image from "next/image";
import { Media } from "./media-feed";

export interface MediaModelProps {
  media: Media;
  onClose: () => void;
}

export function MediaModal({ media, onClose }: MediaModelProps) {
  return (
    <DrawerDialog
      open={!!media}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerDialogContent
        showCloseButton={false}
        className="h-max max-h-[80vh] w-full rounded-md p-0 md:h-full md:max-w-[min(1200px,90vw)]"
      >
        <DrawerDialogTitle className="sr-only">Media Preview</DrawerDialogTitle>
        <DrawerDialogDescription className="sr-only">
          Use this to view the generated media.
        </DrawerDialogDescription>

        <ScrollArea className="h-full w-full">
          <div className="flex w-full flex-col md:h-[80vh] md:flex-row">
            <div className="bg-muted min-h-[50vw] w-full p-6">
              {media.url ? (
                media.type === "video" ? (
                  <video
                    loop
                    controls
                    autoPlay
                    src={media.url}
                    width={media.width ?? 1024}
                    height={media.height ?? 1024}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Image
                    src={media.url}
                    width={media.width ?? 1024}
                    height={media.height ?? 1024}
                    alt={media.prompt ?? media.type}
                    className="h-full w-full object-contain"
                  />
                )
              ) : (
                media.status === "generating" && (
                  <Skeleton className="h-full w-full bg-[#131313]" />
                )
              )}
            </div>

            <div className="bg-card flex flex-col gap-6 overflow-y-auto p-6 md:w-[320px] lg:w-[400px]">
              <div>
                <h2 className="font-headline mb-1 text-lg font-semibold tracking-tight">
                  {media.type === "video" ? "Video" : "Image"}
                </h2>
                <div className="text-[10px] tracking-wider uppercase opacity-50">
                  {new Date(media._creationTime).toLocaleString()}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[10px] tracking-wider uppercase opacity-50">
                  Prompt
                </div>
                <CopyableText
                  text={media.prompt ?? ""}
                  className="line-clamp-3 text-sm leading-relaxed md:line-clamp-6"
                />
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
                {media.status && (
                  <span className="rounded border border-[#353534] bg-[#2a2a2a] px-2 py-1">
                    {media.status}
                  </span>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-2">
                {media.url && (
                  <Button
                    className="justify-start gap-2 text-[#e5e2e1] hover:bg-[#2a2a2a] hover:text-[#efcb61]"
                    variant="ghost"
                    asChild
                  >
                    <a href={media.url} download={`${media.type}-${media._id}`}>
                      <span className="opacity-50">⬇️</span> Download
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
