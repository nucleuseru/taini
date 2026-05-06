"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useQuery } from "convex/react";
import { PackageIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ElementCard } from "./element-card";
import { Element, ElementDetailsSheet } from "./element-details-sheet";

export function ElementsFeed() {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;

  const characters = useQuery(api.character.list, { projectId });
  const environments = useQuery(api.environment.list, { projectId });
  const items = useQuery(api.item.list, { projectId });

  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  if (!characters || !environments || !items) {
    return <ElementsFeedSkeleton />;
  }

  const elements: Element[] = [
    ...characters.map((c) => ({ ...c, type: "character" as const })),
    ...environments.map((e) => ({ ...e, type: "environment" as const })),
    ...items.map((i) => ({ ...i, type: "item" as const })),
  ].sort((a, b) => b._creationTime - a._creationTime);

  if (elements.length === 0) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center py-20 text-center">
        <div className="bg-muted mb-6 flex h-20 w-20 items-center justify-center rounded-3xl opacity-20">
          <PackageIcon size={40} />
        </div>
        <h3 className="font-headline text-xl font-semibold tracking-tight text-[#e5e2e1]">
          No elements yet
        </h3>
        <p className="text-muted-foreground mt-2 max-w-xs text-sm opacity-50">
          Start by adding characters, environments, or items to your project by
          clicking the button on the top right.
        </p>
      </div>
    );
  }

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

      <ElementDetailsSheet
        element={selectedElement}
        onClose={() => {
          setSelectedElement(null);
        }}
      />
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
