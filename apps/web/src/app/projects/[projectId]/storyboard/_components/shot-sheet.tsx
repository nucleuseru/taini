"use client";

import { Media, MediaModal } from "@/components/media-modal";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, Flame, ImageIcon, Play, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export function ShotSheet({
  open,
  onOpenChange,
  shot,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shot: Doc<"shot">;
}) {
  const updateShot = useMutation(api.shot.update);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const startFrames = useQuery(api.image.getMany, {
    ids: shot.startFrames ?? [],
  });
  const endFrames = useQuery(api.image.getMany, {
    ids: shot.endFrames ?? [],
  });
  const videoClips = useQuery(api.video.getMany, {
    ids: (shot.videoClips ?? []) as Id<"video">[],
  });

  const handleSelectFrame = async (
    type: "selectedStartFrame" | "selectedEndFrame",
    imageId: Id<"image">,
  ) => {
    try {
      await updateShot({ id: shot._id, [type]: imageId });
      toast.success("Frame selected");
    } catch {
      toast.error("Failed to select frame");
    }
  };

  const handleSelectVideo = async (videoId: Id<"video">) => {
    try {
      await updateShot({ id: shot._id, selectedVideoClip: videoId });
      toast.success("Video selected");
    } catch {
      toast.error("Failed to select video");
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col border-none bg-[#131313] p-0 sm:max-w-xl">
          <SheetHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl font-bold tracking-tight text-[#e5e2e1]">
                  Shot {shot.order}: {shot.title}
                </SheetTitle>
                <SheetDescription className="mt-1 text-white/40">
                  Manage variants and select keyframes for production.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mb-8 rounded-lg bg-white/3 p-4">
              <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">
                Description
              </div>
              <p className="text-sm leading-relaxed text-[#e5e2e1]">
                {shot.description}
              </p>
            </div>

            <Tabs defaultValue="start" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-3 bg-white/3 p-1">
                <TabsTrigger
                  value="start"
                  className="text-[10px] font-bold tracking-widest uppercase"
                >
                  First Frame
                </TabsTrigger>
                <TabsTrigger
                  value="end"
                  className="text-[10px] font-bold tracking-widest uppercase"
                >
                  End Frame
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="text-[10px] font-bold tracking-widest uppercase"
                >
                  Video Clips
                </TabsTrigger>
              </TabsList>

              <TabsContent value="start" className="mt-0 outline-none">
                <div className="grid grid-cols-2 gap-4">
                  {startFrames?.map((img) => (
                    <MediaCard
                      key={img._id}
                      media={{ ...img, type: "image" as const }}
                      selected={shot.selectedStartFrame === img._id}
                      onSelect={() => {
                        void handleSelectFrame("selectedStartFrame", img._id);
                      }}
                      onClick={() => {
                        setSelectedMedia({
                          ...img,
                          type: "image" as const,
                        });
                      }}
                    />
                  ))}
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-white/3 outline-1 outline-white/10 transition-colors outline-dashed hover:bg-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] font-bold tracking-widest uppercase"
                    >
                      <Flame size={14} className="mr-2" />
                      Inference
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="end" className="mt-0 outline-none">
                <div className="grid grid-cols-2 gap-4">
                  {endFrames?.map((img) => (
                    <MediaCard
                      key={img._id}
                      media={{ ...img, type: "image" as const }}
                      selected={shot.selectedEndFrame === img._id}
                      onSelect={() => {
                        void handleSelectFrame("selectedEndFrame", img._id);
                      }}
                      onClick={() => {
                        setSelectedMedia({
                          ...img,
                          type: "image" as const,
                        });
                      }}
                    />
                  ))}
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-white/3 outline-1 outline-white/10 transition-colors outline-dashed hover:bg-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] font-bold tracking-widest uppercase"
                    >
                      <Flame size={14} className="mr-2" />
                      Inference
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="video" className="mt-0 outline-none">
                <div className="grid grid-cols-2 gap-4">
                  {videoClips?.map((vid) => (
                    <MediaCard
                      key={vid._id}
                      media={{ ...vid, type: "video" as const }}
                      selected={shot.selectedVideoClip === vid._id}
                      onSelect={() => {
                        void handleSelectVideo(vid._id);
                      }}
                      onClick={() => {
                        setSelectedMedia({
                          ...vid,
                          type: "video" as const,
                        });
                      }}
                    />
                  ))}
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-white/3 outline-1 outline-white/10 transition-colors outline-dashed hover:bg-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] font-bold tracking-widest uppercase"
                    >
                      <Play size={14} className="mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {selectedMedia && (
        <MediaModal
          media={selectedMedia}
          onClose={() => {
            setSelectedMedia(null);
          }}
          extraActions={
            selectedMedia.type === "video" ? (
              <Button
                variant="default"
                className="bg-[#efcb61] text-[#3d2f00]"
                onClick={() => {
                  void handleSelectVideo(selectedMedia._id);
                  setSelectedMedia(null);
                }}
              >
                Select as Production Clip
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="default"
                  className="bg-[#efcb61] text-[#3d2f00]"
                  onClick={() => {
                    void handleSelectFrame(
                      "selectedStartFrame",
                      selectedMedia._id,
                    );
                    setSelectedMedia(null);
                  }}
                >
                  Select as First Frame
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    void handleSelectFrame(
                      "selectedEndFrame",
                      selectedMedia._id,
                    );
                    setSelectedMedia(null);
                  }}
                >
                  Select as End Frame
                </Button>
              </div>
            )
          }
        />
      )}
    </>
  );
}

function MediaCard({
  media,
  selected,
  onSelect,
  onClick,
}: {
  media: Media;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  return (
    <div className="group relative aspect-video overflow-hidden rounded-lg bg-white/3 transition-all hover:ring-2 hover:ring-[#efcb61]/50">
      {media.url ? (
        media.type === "video" ? (
          <video
            src={media.url}
            className="h-full w-full cursor-pointer object-cover"
            onClick={onClick}
          />
        ) : (
          <Image
            src={media.url}
            alt="variant"
            fill
            className="cursor-pointer object-cover"
            onClick={onClick}
          />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon className="text-white/10" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="size-7 bg-white/10 hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Check
              size={14}
              className={selected ? "text-[#efcb61]" : "text-white"}
            />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="size-7 bg-white/10 hover:bg-white/20"
          >
            <Trash2 size={14} className="text-red-400" />
          </Button>
        </div>
      </div>

      {selected && (
        <div className="absolute top-2 right-2 rounded-full bg-[#efcb61] p-1">
          <Check size={10} className="text-[#3d2f00]" />
        </div>
      )}
    </div>
  );
}
