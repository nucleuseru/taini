"use client";

import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { SceneCard } from "./scene-card";

export function SceneList({
  storyboardId,
}: {
  storyboardId: Id<"storyboard">;
}) {
  const scenes = useQuery(api.scene.list, { storyboardId });

  if (scenes === undefined) {
    return (
      <div className="flex w-full items-center justify-center p-8">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="flex w-full items-center justify-center rounded-lg border border-dashed p-8">
        <p className="text-muted-foreground text-sm">
          No scenes generated yet. Click &quot;Generate Storyboard&quot; to
          start.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-12">
      {scenes.map((scene, index) => (
        <SceneCard key={scene._id} scene={scene} index={index} />
      ))}
    </div>
  );
}
