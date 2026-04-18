import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { SceneFields } from "./schema";

export const get = authQuery({
  args: { id: v.id("scene") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = authQuery({
  args: { storyboardId: v.id("storyboard") },
  handler: async (ctx, args) => {
    const scenes = await ctx.db
      .query("scene")
      .withIndex("by_storyboard_id", (q) =>
        q.eq("storyboardId", args.storyboardId),
      )
      .collect();

    return scenes.sort((a, b) => a.order - b.order);
  },
});

export const create = authMutation({
  args: {
    storyboardId: SceneFields.storyboardId,
    order: SceneFields.order,
  },
  handler: async (ctx, args) => {
    const sceneId = await ctx.db.insert("scene", args);

    return { sceneId };
  },
});

export const update = authMutation({
  args: {
    id: v.id("scene"),
    order: v.optional(SceneFields.order),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = authMutation({
  args: { id: v.id("scene") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
