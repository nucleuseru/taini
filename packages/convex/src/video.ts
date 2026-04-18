import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { VideoFields } from "./schema";

export const get = authQuery({
  args: { videoId: v.id("video") },
  handler: async (ctx, args) => {
    const video = await ctx.db.get("video", args.videoId);

    if (!video) return;

    const url = video.storageId && (await ctx.storage.getUrl(video.storageId));

    return { ...video, url };
  },
});

export const list = authQuery({
  args: {
    projectId: VideoFields.projectId,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("video")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      videos.page.map(async (video) => {
        const url =
          video.storageId && (await ctx.storage.getUrl(video.storageId));

        return { ...video, url };
      }),
    );

    return { ...videos, page };
  },
});

export const generate = authMutation({
  args: {
    prompt: v.string(),
    audio: VideoFields.audio,
    duration: VideoFields.duration,
    projectId: VideoFields.projectId,
    frameRate: VideoFields.frameRate,
    type: VideoFields.type.members[0],
    resolution: VideoFields.resolution,
    referenceImage: VideoFields.referenceImage,
    referenceVideo: VideoFields.referenceVideo,
    referenceAudio: VideoFields.referenceAudio,
    referenceAudioStart: VideoFields.referenceAudioStart,
  },
  handler: async (ctx, args) => {
    const videoId = await ctx.db.insert("video", {
      ...args,
      status: "pending",
    });

    return { videoId };
  },
});

export const upload = authMutation({
  args: {
    storageId: v.id("_storage"),
    projectId: VideoFields.projectId,
  },
  handler: async (ctx, args) => {
    const videoId = await ctx.db.insert("video", { ...args, uploaded: true });

    return { videoId };
  },
});
