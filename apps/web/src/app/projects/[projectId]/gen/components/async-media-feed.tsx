import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { createLoader, parseAsStringLiteral } from "nuqs/server";
import { MediaFeed } from "./media-feed";

const coordinatesSearchParams = {
  sort: parseAsStringLiteral(["asc", "desc"]).withDefault("desc"),
};

const loadSearchParams = createLoader(coordinatesSearchParams);

export async function AsyncMediaFeed(
  props: PageProps<"/projects/[projectId]/gen">,
) {
  const params = await props.params;
  const projectId = params.projectId as Id<"project">;
  const { sort } = await loadSearchParams(props.searchParams);

  const initialImages = await fetchAuthQuery(api.image.list, {
    sort,
    projectId,
    paginationOpts: {
      cursor: null,
      numItems: 20,
    },
  });

  const initialVideos = await fetchAuthQuery(api.video.list, {
    sort,
    projectId,
    paginationOpts: {
      cursor: null,
      numItems: 20,
    },
  });

  return (
    <MediaFeed
      projectId={projectId}
      initialImages={initialImages.page}
      initialVideos={initialVideos.page}
    />
  );
}
