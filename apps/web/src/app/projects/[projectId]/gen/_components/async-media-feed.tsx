import { Skeleton } from "@/components/ui/skeleton";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { MediaFeed } from "./media-feed";

export async function AsyncMediaFeed(
  props: PageProps<"/projects/[projectId]/gen">,
) {
  const { projectId } = await props.params;

  const [images, videos] = await Promise.all([
    fetchAuthQuery(api.image.list, {
      projectId: projectId as Id<"project">,
      paginationOpts: { cursor: null, numItems: 1024 },
    }),

    fetchAuthQuery(api.video.list, {
      projectId: projectId as Id<"project">,
      paginationOpts: { cursor: null, numItems: 1024 },
    }),
  ]);

  const combinedMedias = [
    ...images.page.map((img) => ({ ...img, type: "image" as const })),
    ...videos.page.map((vid) => ({ ...vid, type: "video" as const })),
  ];

  const sortedMedias = combinedMedias.sort(
    (a, b) => b._creationTime - a._creationTime,
  );

  return <MediaFeed medias={sortedMedias} />;
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
