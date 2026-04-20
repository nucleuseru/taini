import { paginationOptsValidator } from "convex/server";
import { Infer, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { authMutation, authQuery } from "./function";
import { VideoFields } from "./schema";
import { sortOrderValidator } from "./utils";

export const ListVideoArgsValidator = v.object({
  projectId: VideoFields.projectId,
  sort: v.optional(sortOrderValidator),
  paginationOpts: paginationOptsValidator,
});

export const GenerateVideoArgsValidator = v.object({
  prompt: v.string(),
  audio: VideoFields.audio,
  duration: VideoFields.duration,
  projectId: VideoFields.projectId,
  frameRate: VideoFields.frameRate,
  resolution: VideoFields.resolution,
  referenceImage: VideoFields.referenceImage,
  referenceVideo: VideoFields.referenceVideo,
  referenceAudio: VideoFields.referenceAudio,
  referenceAudioStart: VideoFields.referenceAudioStart,
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
    status: "pending",
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
