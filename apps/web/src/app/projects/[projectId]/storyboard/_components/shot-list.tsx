"use client";

import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { ShotCard } from "./shot-card";

export function ShotList({ sceneId }: { sceneId: Id<"scene"> }) {
  const shots = useQuery(api.shot.list, { sceneId });

  if (shots === undefined) {
    return (
      <div className="flex h-32 w-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (shots.length === 0) {
    return (
      <div className="text-muted-foreground flex h-32 w-full items-center justify-center text-sm">
        No shots in this scene.
      </div>
    );
  }

  return (
    <>
      {shots.map((shot, index) => (
        <ShotCard key={shot._id} shot={shot} index={index} />
      ))}
    </>
  );
}
