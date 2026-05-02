"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { usePaginatedQuery } from "convex/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { MediaModal } from "./media-modal";

export type Media = { url?: string | null } & (
  | ({ type: "image" } & Doc<"image">)
  | ({ type: "video" } & Doc<"video">)
);

export function MediaFeed() {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const [selectedMedia, setSelectedMedia] = useState<Media | null>();

  const images = usePaginatedQuery(
    api.image.list,
    { projectId },
    { initialNumItems: 1024 },
  );

  const videos = usePaginatedQuery(
    api.video.list,
    { projectId },
    { initialNumItems: 1024 },
  );

  const combinedMedias = [
    ...images.results.map((img) => ({ ...img, type: "image" as const })),
    ...videos.results.map((vid) => ({ ...vid, type: "video" as const })),
  ];

  const medias = combinedMedias.sort(
    (a, b) => b._creationTime - a._creationTime,
  );

  if (
    images.status === "LoadingFirstPage" ||
    videos.status === "LoadingFirstPage"
  ) {
    return <MediaFeedSkeleton />;
  }

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
        {medias.map((media) => (
          <div
            key={media._id}
            className="group relative cursor-pointer overflow-hidden rounded-md transition-transform hover:scale-[1.02]"
            onClick={() => {
              setSelectedMedia(media);
            }}
          >
            <div className="relative aspect-video bg-[#131313]">
              {media.url ? (
                media.type === "video" ? (
                  <video
                    playsInline
                    src={media.url}
                    width={media.width ?? 1024}
                    height={media.height ?? 1024}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={media.url}
                    width={media.width ?? 1024}
                    height={media.height ?? 1024}
                    alt={media.prompt ?? "Generated image"}
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                media.status === "generating" && (
                  <Skeleton className="bg-card h-full w-full" />
                )
              )}
            </div>

            <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-sm border border-[#353534] bg-[#131313]/80 px-2 py-1 text-[10px] font-semibold tracking-wider text-[#e5e2e1] uppercase backdrop-blur-md">
                {media.type}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedMedia && (
        <MediaModal
          media={selectedMedia}
          onClose={() => {
            setSelectedMedia(null);
          }}
        />
      )}
    </>
  );
}

export function MediaFeedSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="bg-card aspect-video" />
      ))}
    </div>
  );
}
