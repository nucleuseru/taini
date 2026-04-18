import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { ProjectFields } from "./schema";

export const get = authQuery({
  args: {
    projectId: v.id("project"),
  },
  handler: async (cxt, args) => {
    const project = await cxt.db.get("project", args.projectId);

    return project;
  },
});

export const list = authQuery({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("project")
      .withIndex("by_user_id", (q) => q.eq("userId", ctx.user._id))
      .paginate(args.paginationOpts);

    return projects;
  },
});

export const create = authMutation({
  args: { name: v.optional(ProjectFields.name) },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("project", {
      userId: ctx.user._id,
      name: args.name ?? "Untitled",
    });

    return { projectId };
  },
});
