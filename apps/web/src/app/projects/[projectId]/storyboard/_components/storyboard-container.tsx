"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { SceneList } from "./scene-list";

type DragData =
  | { type: "scene"; scene: Doc<"scene"> }
  | { type: "shot"; shot: Doc<"shot"> };

export function StoryboardContainer() {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const storyboard = useQuery(api.storyboard.getByProject, { projectId });
  const updateScene = useMutation(api.scene.update);
  const updateShot = useMutation(api.shot.update);

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;
    const { operation } = event;
    const { source, target } = operation;

    if (!target) return;

    const sourceData = source?.data as DragData;
    const targetData = target.data as DragData;

    if (sourceData.type === "scene" && targetData.type === "scene") {
      const scene = sourceData.scene;
      const targetScene = targetData.scene;
      if (scene._id !== targetScene._id) {
        void updateScene({ id: scene._id, order: targetScene.order });
      }
    } else if (sourceData.type === "shot" && targetData.type === "shot") {
      const shot = sourceData.shot;
      const targetShot = targetData.shot;
      if (shot._id !== targetShot._id) {
        void updateShot({ id: shot._id, order: targetShot.order });
      }
    }
  };

  if (storyboard === undefined) {
    return (
      <div className="flex h-full w-full flex-col space-y-6">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <StoryboardSkeleton />
          </ScrollArea>
        </div>
      </div>
    );
  }

  if (storyboard === null) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white/90">
            Storyboard Void
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Initialize your storyboard to begin the alchemical process.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col space-y-6">
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-hidden">
          <SceneList storyboardId={storyboard._id} />
        </div>
      </DragDropProvider>
    </div>
  );
}

export function StoryboardSkeleton() {
  return (
    <div className="flex h-full w-full flex-row gap-8 pb-24">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex w-[80vw] shrink-0 flex-col overflow-hidden rounded-xl bg-white/3"
        >
          <div className="flex h-full items-stretch">
            {/* Handle and Scene Actions */}
            <div className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-white/5 bg-white/3 py-4">
              <div className="size-6 rounded bg-white/5" />
              <div className="size-8 rounded bg-white/5" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col p-6">
              <div className="mb-6 flex flex-col gap-2">
                <Skeleton className="h-7 w-48 rounded-md bg-white/5" />
                <Skeleton className="h-4 w-full max-w-md rounded-md bg-white/5" />
              </div>

              <div className="flex-1">
                <div className="flex w-max space-x-6 px-6 pb-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={j}
                      className="flex w-72 shrink-0 flex-col overflow-hidden rounded-md bg-white/3"
                    >
                      <Skeleton className="aspect-video w-full rounded-none bg-white/5" />
                      <div className="flex flex-col gap-2 p-4">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-3 w-12 rounded bg-white/5" />
                          <Skeleton className="h-3 w-8 rounded bg-white/5" />
                        </div>
                        <Skeleton className="h-5 w-3/4 rounded bg-white/5" />
                        <Skeleton className="h-3 w-full rounded bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
