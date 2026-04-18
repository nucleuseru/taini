import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { ShotFields } from "./schema";

export const get = authQuery({
  args: { id: v.id("shot") },
  handler: (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const list = authQuery({
  args: { sceneId: ShotFields.sceneId },
  handler: async (ctx, args) => {
    const shots = await ctx.db
      .query("shot")
      .withIndex("by_scene_id", (q) => q.eq("sceneId", args.sceneId))
      .collect();

    return shots.sort((a, b) => a.order - b.order);
  },
});

export const create = authMutation({
  args: {
    order: ShotFields.order,
    sceneId: ShotFields.sceneId,
    duration: ShotFields.duration,
  },
  handler: async (ctx, args) => {
    const shotId = await ctx.db.insert("shot", {
      ...args,
      firstFrames: [],
      videoClips: [],
    });

    return { shotId };
  },
});

export const update = authMutation({
  args: {
    id: v.id("shot"),
    order: v.optional(ShotFields.order),
    duration: v.optional(ShotFields.duration),
    selectedFirstFrame: v.optional(ShotFields.selectedFirstFrame),
    selectedVideoClip: v.optional(ShotFields.selectedVideoClip),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = authMutation({
  args: { id: v.id("shot") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const addFirstFrame = authMutation({
  args: {
    id: v.id("shot"),
    imageId: v.id("image"),
  },
  handler: async (ctx, args) => {
    const shot = await ctx.db.get(args.id);
    if (!shot) throw new Error("Shot not found");

    const firstFrames = shot.firstFrames ?? [];
    await ctx.db.patch(args.id, {
      firstFrames: [...firstFrames, args.imageId],
    });
  },
});

export const addVideoClip = authMutation({
  args: {
    id: v.id("shot"),
    videoId: v.id("video"),
  },
  handler: async (ctx, args) => {
    const shot = await ctx.db.get(args.id);
    if (!shot) throw new Error("Shot not found");

    const videoClips = shot.videoClips ?? [];
    await ctx.db.patch(args.id, {
      videoClips: [...videoClips, args.videoId],
    });
  },
});
