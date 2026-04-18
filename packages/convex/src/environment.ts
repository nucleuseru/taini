import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { EnvironmentFields } from "./schema";

export const get = authQuery({
  args: { environmentId: v.id("environment") },
  handler: (ctx, args) => {
    return ctx.db.get(args.environmentId);
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
    name: EnvironmentFields.name,
    environmentId: v.id("environment"),
    weather: EnvironmentFields.weather,
    location: EnvironmentFields.location,
    timeOfDay: EnvironmentFields.timeOfDay,
    atmosphere: EnvironmentFields.atmosphere,
    description: EnvironmentFields.description,
  },
  handler: async (ctx, args) => {
    const { environmentId, ...fields } = args;
    await ctx.db.patch(environmentId, fields);
  },
});

export const remove = authMutation({
  args: { environmentId: v.id("environment") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.environmentId);
  },
});

export const addReferenceImage = authMutation({
  args: {
    environmentId: v.id("environment"),
    ...EnvironmentFields.referenceImages.element.fields,
  },
  handler: async (ctx, args) => {
    const { environmentId, ...imageRef } = args;
    const environment = await ctx.db.get(environmentId);
    if (!environment) throw new Error("Environment not found");

    await ctx.db.patch(environmentId, {
      referenceImages: [...environment.referenceImages, imageRef],
    });
  },
});
