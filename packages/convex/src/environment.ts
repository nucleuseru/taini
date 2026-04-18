import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { EnvironmentFields } from "./schema";

export const get = authQuery({
  args: { id: v.id("environment") },
  handler: (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const list = authQuery({
  args: { projectId: EnvironmentFields.projectId },
  handler: (ctx, args) => {
    return ctx.db
      .query("environment")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const create = authMutation({
  args: {
    name: EnvironmentFields.name,
    weather: EnvironmentFields.weather,
    location: EnvironmentFields.location,
    timeOfDay: EnvironmentFields.timeOfDay,
    projectId: EnvironmentFields.projectId,
    atmosphere: EnvironmentFields.atmosphere,
    description: EnvironmentFields.description,
  },
  handler: async (ctx, args) => {
    const environmentId = await ctx.db.insert("environment", {
      ...args,
      referenceImages: [],
    });
    return { environmentId };
  },
});

export const update = authMutation({
  args: {
    id: v.id("environment"),
    name: EnvironmentFields.name,
    weather: EnvironmentFields.weather,
    location: EnvironmentFields.location,
    timeOfDay: EnvironmentFields.timeOfDay,
    atmosphere: EnvironmentFields.atmosphere,
    description: EnvironmentFields.description,
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = authMutation({
  args: { id: v.id("environment") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const addReferenceImage = authMutation({
  args: {
    id: v.id("environment"),
    ...EnvironmentFields.referenceImages.element.fields,
  },
  handler: async (ctx, args) => {
    const { id, ...imageRef } = args;
    const environment = await ctx.db.get(id);
    if (!environment) throw new Error("Environment not found");

    await ctx.db.patch(id, {
      referenceImages: [...environment.referenceImages, imageRef],
    });
  },
});
