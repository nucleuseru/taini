"use client";

import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { usePaginatedQuery, UsePaginatedQueryReturnType } from "convex/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { MediaModal } from "./media-modal";

export interface MediaFeedProps {
  projectId: Id<"project">;
  initialImages: UsePaginatedQueryReturnType<typeof api.image.list>["results"];
  initialVideos: UsePaginatedQueryReturnType<typeof api.video.list>["results"];
}

export type Media = { url?: string } & (
  | ({ type: "image" } & Doc<"image">)
  | ({ type: "video" } & Doc<"video">)
);

export function MediaFeed(props: MediaFeedProps) {
  const { initialImages, initialVideos, projectId } = props;

  const {
    results: images,
    status: imgStatus,
    loadMore: loadMoreImg,
  } = usePaginatedQuery(api.image.list, { projectId }, { initialNumItems: 20 });

  const {
    results: videos,
    status: vidStatus,
    loadMore: loadMoreVid,
  } = usePaginatedQuery(api.video.list, { projectId }, { initialNumItems: 20 });

  const [selectedMedia, setSelectedMedia] = useState<Media | null>();

  const combinedMedia = useMemo(() => {
    const activeImages = images.length > 0 ? images : initialImages;
    const activeVideos = videos.length > 0 ? videos : initialVideos;

    const all = [
      ...activeImages.map((img) => ({ ...img, type: "image" as const })),
      ...activeVideos.map((vid) => ({ ...vid, type: "video" as const })),
    ];

    return all.sort((a, b) => b._creationTime - a._creationTime);
  }, [images, videos, initialImages, initialVideos]);

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {combinedMedia.map((media) => (
          <div
            key={media._id}
            className="group relative cursor-pointer overflow-hidden rounded-md transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: "#0e0e0e" }}
            onClick={() => {
              setSelectedMedia(media as Media);
            }}
          >
            <div className="relative aspect-[16/9] bg-[#2a2a2a]">
              {media.url ? (
                media.type === "video" ? (
                  <video
                    src={media.url}
                    className="h-full w-full object-cover"
                    playsInline
                  />
                ) : (
                  <Image
                    src={media.url}
                    alt={media.prompt ?? "Generated image"}
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-xs opacity-70">
                  <div className="absolute top-0 left-0 h-1 w-full bg-[#353534]">
                    <div className="h-full w-1/2 animate-pulse bg-gradient-to-r from-[#efcb61] to-[#d2af48]"></div>
                  </div>
                  {media.status ?? "Generating..."}
                </div>
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

      {(imgStatus === "CanLoadMore" || vidStatus === "CanLoadMore") && (
        <button
          onClick={() => {
            if (imgStatus === "CanLoadMore") loadMoreImg(20);
            if (vidStatus === "CanLoadMore") loadMoreVid(20);
          }}
          className="mt-12 rounded-sm bg-[#2a2a2a] px-6 py-2 text-sm font-medium tracking-wide text-[#e5e2e1] uppercase transition-colors hover:bg-[#353534]"
        >
          Load More
        </button>
      )}

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
