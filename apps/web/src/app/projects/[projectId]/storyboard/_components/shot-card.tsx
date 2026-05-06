"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { api } from "@repo/convex/api";
import { Doc } from "@repo/convex/dataModel";
import { useQuery } from "convex/react";
import { ImageIcon, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ShotSheet } from "./shot-sheet";

export interface ShotCardProps {
  index: number;
  shot: Doc<"shot">;
}

export function ShotCard({ shot, index }: ShotCardProps) {
  const { ref, handleRef, isDragging } = useSortable({
    index,
    id: shot._id,
    type: "shot",
    accept: "shot",
    group: shot.sceneId,
    data: { type: "shot", shot },
  });

  const style = {
    opacity: isDragging ? 0 : 1,
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
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div
        ref={ref}
        style={style}
        className="group relative flex w-72 shrink-0 flex-col overflow-hidden rounded-md bg-white/3 transition-all hover:bg-white/5 active:scale-[0.98]"
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <div
          className="bg-muted relative aspect-video w-full cursor-pointer overflow-hidden"
          onClick={() => {
            setSheetOpen(true);
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
              width={startFrame.width ?? 1024}
              height={startFrame.height ?? 1024}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/5">
              <ImageIcon className="size-8 text-white/10" />
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          {videoClip?.url && (
            <div className="absolute right-3 bottom-3 rounded-full bg-black/40 p-2 backdrop-blur-md">
              <Play className="size-3 fill-[#efcb61] text-[#efcb61]" />
            </div>
          )}
        </div>

        <div
          className="flex cursor-pointer flex-col gap-1 p-4"
          onClick={() => {
            setSheetOpen(true);
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#efcb61] uppercase">
              Shot {shot.order}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-white/20 uppercase">
              {shot.duration}s
            </span>
          </div>
          <h4 className="truncate text-sm font-semibold text-[#e5e2e1]">
            {shot.title}
          </h4>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-white/40">
            {shot.description}
          </p>
        </div>

        <div
          ref={handleRef}
          className="absolute top-2 left-2 z-10 cursor-grab rounded bg-black/40 p-1 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white/60"
          >
            <path
              d="M6 3H7V4H6V3ZM9 3H10V4H9V3ZM6 6H7V7H6V6ZM9 6H10V7H9V6ZM6 9H7V10H6V9ZM9 9H10V10H9V9ZM6 12H7V13H6V12ZM9 12H10V13H9V12Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <ShotSheet open={sheetOpen} onOpenChange={setSheetOpen} shot={shot} />
    </>
  );
}
