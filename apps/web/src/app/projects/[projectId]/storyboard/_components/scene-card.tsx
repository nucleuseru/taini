"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSortable } from "@dnd-kit/react/sortable";
import { Doc } from "@repo/convex/dataModel";
import { GripVertical } from "lucide-react";
import { ShotList } from "./shot-list";

export function SceneCard({
  scene,
  index,
}: {
  scene: Doc<"scene">;
  index: number;
}) {
  const { listeners, ref, handleRef, isDragging } = useSortable({
    id: `scene-${scene._id}`,
    index,
    data: { type: "Scene", scene },
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={ref}
      style={style}
      className="flex flex-col gap-4 p-4 lg:flex-row lg:items-stretch"
    >
      <div className="flex w-full shrink-0 flex-col gap-2 lg:w-64">
        <div className="flex items-center gap-2">
          <div
            ref={handleRef}
            {...listeners}
            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <h3 className="line-clamp-2 leading-tight font-semibold">
            {scene.title}
          </h3>
        </div>
        <p className="text-muted-foreground line-clamp-4 pl-7 text-sm">
          {scene.description}
        </p>
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <ScrollArea className="bg-muted/20 w-full rounded-md border whitespace-nowrap">
          <div className="flex w-max space-x-4 p-4">
            <ShotList sceneId={scene._id} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </Card>
  );
}
