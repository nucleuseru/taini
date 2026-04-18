import { Infer, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { authMutation, authQuery } from "./function";
import { EnvironmentFields } from "./schema";

export const ListEnvironmentArgsValidator = v.object({
  projectId: EnvironmentFields.projectId,
});

export const CreateEnvironmentArgsValidator = v.object({
  name: EnvironmentFields.name,
  weather: EnvironmentFields.weather,
  location: EnvironmentFields.location,
  timeOfDay: EnvironmentFields.timeOfDay,
  projectId: EnvironmentFields.projectId,
  atmosphere: EnvironmentFields.atmosphere,
  description: EnvironmentFields.description,
});

export const UpdateEnvironmentArgsValidator = v.object({
  id: v.id("environment"),
  name: v.optional(EnvironmentFields.name),
  weather: v.optional(EnvironmentFields.weather),
  location: v.optional(EnvironmentFields.location),
  timeOfDay: v.optional(EnvironmentFields.timeOfDay),
  atmosphere: v.optional(EnvironmentFields.atmosphere),
  description: v.optional(EnvironmentFields.description),
});

export const AddEnvironmentReferenceImageArgsValidator = v
  .object({
    id: v.id("environment"),
  })
  .extend(EnvironmentFields.referenceImages.element.fields);

export const getEnvironmentByIdHandler = (
  ctx: QueryCtx,
  id: Id<"environment">,
) => {
  return ctx.db.get(id);
};

export const listEnvironmentsHandler = (
  ctx: QueryCtx,
  options: Infer<typeof ListEnvironmentArgsValidator>,
) => {
  return ctx.db
    .query("environment")
    .withIndex("by_project_id", (q) => q.eq("projectId", options.projectId))
    .collect();
};

export const createEnvironmentHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof CreateEnvironmentArgsValidator>,
) => {
  const environmentId = await ctx.db.insert("environment", {
    ...options,
    referenceImages: [],
  });
  return { environmentId };
};

export const updateEnvironmentHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof UpdateEnvironmentArgsValidator>,
) => {
  const { id, ...fields } = options;
  await ctx.db.patch(id, fields);
};

export const addEnvironmentReferenceImageHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof AddEnvironmentReferenceImageArgsValidator>,
) => {
  const { id, ...imageRef } = options;
  const environment = await ctx.db.get(id);
  if (!environment) throw new Error("Environment not found");

  await ctx.db.patch(id, {
    referenceImages: [...environment.referenceImages, imageRef],
  });
};

export const get = authQuery({
  args: { id: v.id("environment") },
  handler: (ctx, args) => getEnvironmentByIdHandler(ctx, args.id),
});

export const list = authQuery({
  args: ListEnvironmentArgsValidator,
  handler: (ctx, args) => listEnvironmentsHandler(ctx, args),
});

export const create = authMutation({
  args: CreateEnvironmentArgsValidator,
  handler: (ctx, args) => createEnvironmentHandler(ctx, args),
});

export const update = authMutation({
  args: UpdateEnvironmentArgsValidator,
  handler: (ctx, args) => updateEnvironmentHandler(ctx, args),
});

export const addReferenceImage = authMutation({
  args: AddEnvironmentReferenceImageArgsValidator,
  handler: (ctx, args) => addEnvironmentReferenceImageHandler(ctx, args),
});

export const remove = authMutation({
  args: { id: v.id("environment") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
