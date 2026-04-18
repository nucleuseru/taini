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
    narrative: StoryboardFields.narrative,
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
    script: v.optional(StoryboardFields.script),
    narrative: v.optional(StoryboardFields.narrative),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});
