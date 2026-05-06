"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSortable } from "@dnd-kit/react/sortable";
import { Doc } from "@repo/convex/dataModel";
import { Flame, MoreHorizontal } from "lucide-react";
import { ShotList } from "./shot-list";

export function SceneCard({
  scene,
  index,
}: {
  scene: Doc<"scene">;
  index: number;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    index,
    id: scene._id,
    type: "scene",
    accept: ["scene", "shot"],
    data: { type: "scene", scene },
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={ref}
      style={style}
      className="flex w-[80vw] shrink-0 flex-col overflow-hidden rounded-xl bg-white/3 transition-colors hover:bg-white/[0.04]"
    >
      <div className="flex items-stretch">
        {/* Handle and Scene Actions */}
        <div className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-white/5 bg-white/3 py-4">
          <div
            ref={handleRef}
            className="cursor-grab text-white/20 transition-colors hover:text-white/60 active:cursor-grabbing"
          >
            <svg
              width="16"
              height="24"
              viewBox="0 0 16 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 4H7V5H6V4ZM9 4H10V5H9V4ZM6 8H7V9H6V8ZM9 8H10V9H9V8ZM6 12H7V13H6V12ZM9 12H10V13H9V12ZM6 16H7V17H6V16ZM9 16H10V17H9V16ZM6 20H7V21H6V20ZM9 20H10V21H9V20Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-white/20 hover:bg-white/5 hover:text-white"
              >
                <MoreHorizontal size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-48 border-none bg-[#1a1a1a] p-1 text-[#e5e2e1] shadow-2xl"
              align="start"
              side="right"
            >
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-bold text-[#efcb61] transition-colors hover:bg-white/5">
                <Flame size={14} />
                Generate Scene
              </button>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-6">
          <div className="mb-6 flex flex-col gap-1">
            <h3 className="font-headline text-lg font-bold tracking-tight text-[#e5e2e1]">
              {scene.title}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-white/40">
              {scene.description}
            </p>
          </div>

          <div className="-mx-6">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-6 px-6 pb-4">
                <ShotList sceneId={scene._id} />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
