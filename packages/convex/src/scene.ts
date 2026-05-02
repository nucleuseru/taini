import { Infer, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { authMutation, authQuery } from "./function";
import { SceneFields } from "./schema";

export const ListSceneArgsValidator = v.object({
  storyboardId: v.id("storyboard"),
});

export const CreateSceneArgsValidator = v.object({
  storyboardId: SceneFields.storyboardId,
  order: SceneFields.order,
  title: SceneFields.title,
  description: SceneFields.description,
});

export const UpdateSceneArgsValidator = v.object({
  id: v.id("scene"),
  title: v.optional(SceneFields.title),
  order: v.optional(SceneFields.order),
});

export const getSceneByIdHandler = (ctx: QueryCtx, id: Id<"scene">) => {
  return ctx.db.get(id);
};

export const listScenesHandler = async (
  ctx: QueryCtx,
  options: Infer<typeof ListSceneArgsValidator>,
) => {
  const scenes = await ctx.db
    .query("scene")
    .withIndex("by_storyboard_id", (q) =>
      q.eq("storyboardId", options.storyboardId),
    )
    .collect();

  return scenes.sort((a, b) => a.order - b.order);
};

export const createSceneHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof CreateSceneArgsValidator>,
) => {
  const sceneId = await ctx.db.insert("scene", options);
  return { sceneId };
};

export const updateSceneHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof UpdateSceneArgsValidator>,
) => {
  const { id, ...fields } = options;
  await ctx.db.patch(id, fields);
};

export const get = authQuery({
  args: { id: v.id("scene") },
  handler: (ctx, args) => getSceneByIdHandler(ctx, args.id),
});

export const list = authQuery({
  args: ListSceneArgsValidator,
  handler: (ctx, args) => listScenesHandler(ctx, args),
});

export const create = authMutation({
  args: CreateSceneArgsValidator,
  handler: (ctx, args) => createSceneHandler(ctx, args),
});

export const update = authMutation({
  args: UpdateSceneArgsValidator,
  handler: (ctx, args) => updateSceneHandler(ctx, args),
});

export const remove = authMutation({
  args: { id: v.id("scene") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
