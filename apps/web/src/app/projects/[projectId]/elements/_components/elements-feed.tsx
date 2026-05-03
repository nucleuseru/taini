"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ElementCard } from "./element-card";
import { ElementDetailsSheet } from "./element-details-sheet";
import { Element } from "./element-details-sheet/types";

export function ElementsFeed() {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;

  const characters = useQuery(api.character.list, { projectId });
  const environments = useQuery(api.environment.list, { projectId });
  const items = useQuery(api.item.list, { projectId });

  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  if (!characters && !environments && !items) {
    return <ElementsFeedSkeleton />;
  }

  const elements = [
    ...(characters?.map((c) => ({ ...c, type: "character" as const })) ?? []),
    ...(environments?.map((e) => ({ ...e, type: "environment" as const })) ??
      []),
    ...(items?.map((i) => ({ ...i, type: "item" as const })) ?? []),
  ].sort((a, b) => b._creationTime - a._creationTime);

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
        {elements.map((element) => (
          <ElementCard
            key={element._id}
            {...element}
            onClick={() => {
              setSelectedElement(element);
            }}
          />
        ))}
      </div>

      {selectedElement && (
        <ElementDetailsSheet
          element={selectedElement}
          onClose={() => {
            setSelectedElement(null);
          }}
        />
      )}
    </>
  );
}

export function ElementsFeedSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="bg-card aspect-square" />
      ))}
    </div>
  );
}
