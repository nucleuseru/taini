import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { StoryboardFields } from "./schema";

export const get = authQuery({
  args: { id: v.id("storyboard") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByProject = authQuery({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("storyboard")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

export const create = authMutation({
  args: {
    projectId: StoryboardFields.projectId,
    script: StoryboardFields.script,
    audio: StoryboardFields.audio,
    width: StoryboardFields.width,
    height: StoryboardFields.height,
    frameRate: StoryboardFields.frameRate,
    style: StoryboardFields.style,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("storyboard")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("storyboard", args);
  },
});

export const update = authMutation({
  args: {
    id: v.id("storyboard"),
    threadId: StoryboardFields.threadId,
    script: v.optional(StoryboardFields.script),
    width: StoryboardFields.width,
    height: StoryboardFields.height,
    frameRate: StoryboardFields.frameRate,
    style: StoryboardFields.style,
    referenceStyle: StoryboardFields.referenceStyle,
    audio: StoryboardFields.audio,
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const exportData = authQuery({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    const storyboard = await ctx.db
      .query("storyboard")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (!storyboard) return null;

    const scenes = await ctx.db
      .query("scene")
      .withIndex("by_storyboard_id", (q) =>
        q.eq("storyboardId", storyboard._id),
      )
      .collect();

    scenes.sort((a, b) => a.order - b.order);

    const scenesWithShots = await Promise.all(
      scenes.map(async (scene) => {
        const shots = await ctx.db
          .query("shot")
          .withIndex("by_scene_id", (q) => q.eq("sceneId", scene._id))
          .collect();

        shots.sort((a, b) => a.order - b.order);

        const enrichedShots = await Promise.all(
          shots.map(async (shot) => {
            let startFrameUrl = null;
            if (shot.selectedStartFrame) {
              const img = await ctx.db.get(shot.selectedStartFrame);
              if (img?.storageId)
                startFrameUrl = await ctx.storage.getUrl(img.storageId);
            }

            let endFrameUrl = null;
            if (shot.selectedEndFrame) {
              const img = await ctx.db.get(shot.selectedEndFrame);
              if (img?.storageId)
                endFrameUrl = await ctx.storage.getUrl(img.storageId);
            }

            let videoUrl = null;
            if (shot.selectedVideoClip) {
              const vid = await ctx.db.get(shot.selectedVideoClip);
              if (vid?.storageId)
                videoUrl = await ctx.storage.getUrl(vid.storageId);
            }

            return {
              ...shot,
              selectedStartFrameUrl: startFrameUrl,
              selectedEndFrameUrl: endFrameUrl,
              selectedVideoClipUrl: videoUrl,
            };
          }),
        );

        return { ...scene, shots: enrichedShots };
      }),
    );

    return { ...storyboard, scenes: scenesWithShots };
  },
});
