import { paginationOptsValidator } from "convex/server";
import { ConvexError, Infer, v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  httpAction,
  internalAction,
  internalQuery,
  MutationCtx,
  QueryCtx,
} from "./_generated/server";
import { authMutation, authQuery, internalMutation } from "./function";
import { VideoFields } from "./schema";
import { triggers } from "./triggers";
import { generateRandomInt, RunPodData, sortOrderValidator } from "./utils";

export const ListVideoArgsValidator = v.object({
  projectId: VideoFields.projectId,
  sort: v.optional(sortOrderValidator),
  paginationOpts: paginationOptsValidator,
});

export const GenerateVideoArgsValidator = v.object({
  prompt: v.string(),
  width: VideoFields.width,
  height: VideoFields.height,
  status: VideoFields.status,
  duration: VideoFields.duration,
  projectId: VideoFields.projectId,
  frameRate: VideoFields.frameRate,
  startFrame: VideoFields.startFrame,
  endFrame: VideoFields.endFrame,
  negativePrompt: VideoFields.negativePrompt,
});

export const UploadVideoArgsValidator = v.object({
  storageId: v.id("_storage"),
  projectId: VideoFields.projectId,
});

export const getVideoByIdHandler = async (ctx: QueryCtx, id: Id<"video">) => {
  const video = await ctx.db.get("video", id);
  if (!video) return null;
  const url = video.storageId && (await ctx.storage.getUrl(video.storageId));
  return { ...video, url };
};

export const listVideosHandler = async (
  ctx: QueryCtx,
  options: Infer<typeof ListVideoArgsValidator>,
) => {
  const videos = await ctx.db
    .query("video")
    .withIndex("by_project_id", (q) => q.eq("projectId", options.projectId))
    .order(options.sort ?? "desc")
    .paginate(options.paginationOpts);

  const page = await Promise.all(
    videos.page.map(async (video) => {
      const url =
        video.storageId && (await ctx.storage.getUrl(video.storageId));

      return { ...video, url };
    }),
  );

  return { ...videos, page };
};

export const generateVideoHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof GenerateVideoArgsValidator>,
) => {
  const videoId = await ctx.db.insert("video", {
    ...options,
    status: options.status ?? "pending",
    seed: generateRandomInt(4_000_000_000),
  });

  return { videoId };
};

export const get = authQuery({
  args: { id: v.id("video") },
  handler: (ctx, args) => getVideoByIdHandler(ctx, args.id),
});

export const list = authQuery({
  args: ListVideoArgsValidator,
  handler: (ctx, args) => listVideosHandler(ctx, args),
});

export const generate = authMutation({
  args: GenerateVideoArgsValidator,
  handler: (ctx, args) => generateVideoHandler(ctx, args),
});

export const upload = authMutation({
  args: UploadVideoArgsValidator,
  handler: async (ctx, args) => {
    const videoId = await ctx.db.insert("video", { ...args, uploaded: true });
    return { videoId };
  },
});

export const removeVideoHandler = async (ctx: MutationCtx, id: Id<"video">) => {
  const video = await ctx.db.get(id);
  if (!video) return;
  if (video.storageId) {
    await ctx.storage.delete(video.storageId);
  }
  await ctx.db.delete(id);
};

export const remove = authMutation({
  args: { id: v.id("video") },
  handler: (ctx, args) => removeVideoHandler(ctx, args.id),
});

export const triggerInference = authMutation({
  args: { id: v.id("video") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "queued" });
  },
});

export const getByJobId = internalQuery({
  args: { jobId: v.string() },
  handler: (ctx, args) => {
    return ctx.db
      .query("video")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .unique();
  },
});

export const update = internalMutation({
  args: {
    id: v.id("video"),
    jobId: VideoFields.jobId,
    storageId: VideoFields.storageId,
    status: VideoFields.status,
  },
  handler: (ctx, args) => {
    const { id, ...rest } = args;
    return ctx.db.patch(id, rest);
  },
});

export const inference = internalAction({
  args: {
    id: v.id("video"),
    prompt: v.string(),
    seed: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    start_frame: v.optional(v.string()),
    end_frame: v.optional(v.string()),
    negative_prompt: v.optional(v.string()),
    frame_rate: v.optional(VideoFields.frameRate),
  },
  handler: async (ctx, args) => {
    const { id: videoId, ...input } = args;

    const response = await fetch(
      "https://api.runpod.ai/v2/y4k7x6m6ur4v51/run",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RUNPOD_API_KEY ?? ""}`,
        },
        body: JSON.stringify({
          input,
          webhook: `${process.env.CONVEX_SITE_URL ?? ""}/webhook/video`,
        }),
      },
    );

    if (!response.ok) {
      throw new ConvexError(
        `HTTP error! status: ${response.status.toString()}`,
      );
    }

    const data = (await response.json()) as RunPodData;

    await ctx.runMutation(internal.video.update, {
      id: videoId,
      jobId: data.id,
      status: "generating",
    });
  },
});

export const webhook = httpAction(async (ctx, request) => {
  const data = (await request.json()) as RunPodData<{
    storage_id: Id<"_storage">;
  }>;

  const video = await ctx.runQuery(internal.video.getByJobId, {
    jobId: data.id,
  });

  if (!video) return new Response();

  if (data.status === "COMPLETED") {
    await ctx.runMutation(internal.video.update, {
      id: video._id,
      status: "completed",
      storageId: data.output.storage_id,
    });
  } else {
    await ctx.runMutation(internal.video.update, {
      id: video._id,
      status: "failed",
    });
  }

  return new Response();
});

triggers.register("video", async (ctx, change) => {
  if (change.operation === "delete") return;
  if (change.newDoc.status !== "queued") return;

  if (!change.newDoc.prompt?.trim()) {
    await ctx.db.patch(change.id, { status: "failed" });
    return;
  }

  if (change.newDoc.storageId) {
    await ctx.db.patch(change.id, { status: "completed" });
    return;
  }

  const startFrameUrl = change.newDoc.startFrame
    ? await ctx.storage.getUrl(
        (await ctx.db.get("image", change.newDoc.startFrame))?.storageId ??
          ("" as Id<"_storage">),
      )
    : undefined;

  const endFrameUrl = change.newDoc.endFrame
    ? await ctx.storage.getUrl(
        (await ctx.db.get("image", change.newDoc.endFrame))?.storageId ??
          ("" as Id<"_storage">),
      )
    : undefined;

  await ctx.scheduler.runAfter(0, internal.video.inference, {
    id: change.id,
    prompt: change.newDoc.prompt,
    seed: change.newDoc.seed ?? undefined,
    width: change.newDoc.width ?? undefined,
    height: change.newDoc.height ?? undefined,
    duration: change.newDoc.duration ?? undefined,
    frame_rate: change.newDoc.frameRate ?? undefined,
    start_frame: startFrameUrl ?? undefined,
    end_frame: endFrameUrl ?? undefined,
    negative_prompt: change.newDoc.negativePrompt ?? undefined,
  });
});
