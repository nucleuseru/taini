"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { CreateStoryboardForm } from "./create-storyboard-form";
import { SceneList } from "./scene-list";
import { StoryboardActions } from "./storyboard-actions";

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

    const sourceData = source.data as { type: string; scene?: any; shot?: any };
    const targetData = target.data as { type: string; scene?: any; shot?: any };

    if (sourceData.type === "Scene" && targetData.type === "Scene") {
      const scene = sourceData.scene;
      const targetScene = targetData.scene;
      if (scene._id !== targetScene._id) {
        void updateScene({ id: scene._id, order: targetScene.order });
      }
    } else if (sourceData.type === "Shot" && targetData.type === "Shot") {
      const shot = sourceData.shot;
      const targetShot = targetData.shot;
      if (shot._id !== targetShot._id) {
        void updateShot({ id: shot._id, order: targetShot.order });
      }
    }
  };

  if (storyboard === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (storyboard === null) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            No Storyboard Found
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Create a storyboard to map out your scenes and shots.
          </p>
        </div>
        <CreateStoryboardForm projectId={projectId} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Storyboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage scenes, shots, and media generation.
          </p>
        </div>
        <StoryboardActions projectId={projectId} />
      </div>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <SceneList storyboardId={storyboard._id} />
          </ScrollArea>
        </div>
      </DragDropProvider>
    </div>
  );
}
