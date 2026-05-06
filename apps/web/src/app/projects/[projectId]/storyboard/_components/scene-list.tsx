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
      <div className="flex w-full items-center justify-center p-12">
        <p className="text-sm font-medium tracking-wide text-white/20">
          The script awaits its visualization.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-24">
      {scenes.map((scene, index) => (
        <SceneCard key={scene._id} scene={scene} index={index} />
      ))}
    </div>
  );
}
