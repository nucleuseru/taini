"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Doc } from "@repo/convex/dataModel";
import Image from "next/image";
import { useState } from "react";
import { MediaModal } from "./media-modal";

export type Media = { url?: string | null } & (
  | ({ type: "image" } & Doc<"image">)
  | ({ type: "video" } & Doc<"video">)
);

export interface MediaFeedProps {
  medias: Media[];
}

export function MediaFeed({ medias }: MediaFeedProps) {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>();

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
            <Skeleton className="bg-card relative aspect-video">
              {media.url &&
                (media.type === "video" ? (
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
                ))}
            </Skeleton>

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
