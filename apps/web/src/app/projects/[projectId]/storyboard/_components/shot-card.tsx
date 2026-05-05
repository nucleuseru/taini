"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { api } from "@repo/convex/api";
import { Doc } from "@repo/convex/dataModel";
import { useQuery } from "convex/react";
import { GripVertical, Image as ImageIcon, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FrameSelector } from "./frame-selector";

export function ShotCard({
  shot,
  index,
}: {
  shot: Doc<"shot">;
  index: number;
}) {
  const { listeners, ref, handleRef, isDragging } = useSortable({
    id: `shot-${shot._id}`,
    index,
    data: { type: "Shot", shot },
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  const startFrame = useQuery(
    api.image.get,
    shot.selectedStartFrame ? { id: shot.selectedStartFrame } : "skip",
  );

  const videoClip = useQuery(
    api.video.get,
    shot.selectedVideoClip ? { id: shot.selectedVideoClip } : "skip",
  );

  const [isHovered, setIsHovered] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <>
      <div
        ref={ref}
        style={style}
        className="group bg-background relative flex w-64 shrink-0 flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md"
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <div
          ref={handleRef}
          {...listeners}
          className="bg-background/80 text-muted-foreground hover:text-foreground absolute top-2 left-2 z-10 cursor-grab rounded-md p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <div
          className="bg-muted relative aspect-video w-full cursor-pointer"
          onClick={() => {
            setSelectorOpen(true);
          }}
        >
          {isHovered && videoClip?.url ? (
            <video
              src={videoClip.url}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : startFrame?.url ? (
            <Image
              src={startFrame.url}
              alt={shot.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center">
              <ImageIcon className="h-8 w-8 opacity-20" />
            </div>
          )}

          {!isHovered && videoClip?.url && (
            <div className="bg-background/80 absolute right-2 bottom-2 rounded-full p-1.5 backdrop-blur-sm">
              <Play className="h-3 w-3 fill-current" />
            </div>
          )}
        </div>

        <div
          className="flex cursor-pointer flex-col gap-1 p-3"
          onClick={() => {
            setSelectorOpen(true);
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {shot.order}
            </span>
            <span className="text-muted-foreground text-xs">
              {shot.duration}s
            </span>
          </div>
          <h4 className="truncate leading-tight font-medium">{shot.title}</h4>
          <p className="text-muted-foreground line-clamp-2 text-xs">
            {shot.description}
          </p>
        </div>
      </div>

      <FrameSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        shot={shot}
      />
    </>
  );
}
