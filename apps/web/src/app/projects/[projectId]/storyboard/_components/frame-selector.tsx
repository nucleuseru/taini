"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

export function FrameSelector({
  open,
  onOpenChange,
  shot,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shot: Doc<"shot">;
}) {
  const updateShot = useMutation(api.shot.update);

  const startFrames = useQuery(
    api.image.getMany,
    shot.startFrames && shot.startFrames.length > 0
      ? { ids: shot.startFrames }
      : "skip",
  );

  const endFrames = useQuery(
    api.image.getMany,
    shot.endFrames && shot.endFrames.length > 0
      ? { ids: shot.endFrames }
      : "skip",
  );

  // Since video doesn't have getMany exported, we can just fetch them individually
  // or add a getMany to video.ts. Assuming we just show what we have.
  // Actually, wait, video.ts does not have getMany. We can just list all videos for project and filter? No, we should just show the selected one for now or skip fetching all variants if not supported.
  // We'll skip displaying multiple video clips for this iteration unless we add getMany.

  const handleSelectStartFrame = async (imageId: Id<"image">) => {
    await updateShot({ id: shot._id, selectedStartFrame: imageId });
  };

  const handleSelectEndFrame = async (imageId: Id<"image">) => {
    void updateShot({ id: shot._id, selectedEndFrame: imageId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-4xl flex-col p-0">
        <DialogHeader className="shrink-0 p-6 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <span>{shot.title} - Variants</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">Start Frames</h3>
                <Button variant="outline" size="sm">
                  Upload Frame
                </Button>
              </div>

              {startFrames === undefined &&
              shot.startFrames &&
              shot.startFrames.length > 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                </div>
              ) : startFrames?.length ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {startFrames.map((frame) => {

                    const isSelected = shot.selectedStartFrame === frame._id;
                    return (
                      <div
                        key={frame._id}
                        className={cn(
                          "hover:border-primary/50 relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                          isSelected ? "border-primary" : "border-transparent",
                        )}
                        onClick={() => {
                          void handleSelectStartFrame(frame._id);
                        }}
                      >
                        {}
                        {frame.url ? (
                          <Image
                            src={frame.url}
                            alt="Start frame variant"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-muted flex h-full w-full items-center justify-center">
                            <ImageIcon className="text-muted-foreground/30 h-8 w-8" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="bg-background absolute top-2 right-2 rounded-full p-0.5">
                            <CheckCircle2 className="fill-primary text-primary-foreground h-5 w-5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed text-sm">
                  No start frames generated yet.
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">End Frames</h3>
                <Button variant="outline" size="sm">
                  Upload Frame
                </Button>
              </div>

              {endFrames === undefined &&
              shot.endFrames &&
              shot.endFrames.length > 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                </div>
              ) : endFrames?.length ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {endFrames.map((frame) => {

                    const isSelected = shot.selectedEndFrame === frame._id;
                    return (
                      <div
                        key={frame._id}
                        className={cn(
                          "hover:border-primary/50 relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                          isSelected ? "border-primary" : "border-transparent",
                        )}
                        onClick={() => {
                          void handleSelectEndFrame(frame._id);
                        }}
                      >
                        {}
                        {frame.url ? (
                          <Image
                            src={frame.url}
                            alt="End frame variant"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-muted flex h-full w-full items-center justify-center">
                            <ImageIcon className="text-muted-foreground/30 h-8 w-8" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="bg-background absolute top-2 right-2 rounded-full p-0.5">
                            <CheckCircle2 className="fill-primary text-primary-foreground h-5 w-5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed text-sm">
                  No end frames generated yet.
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
