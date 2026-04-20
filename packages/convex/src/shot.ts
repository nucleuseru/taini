import { Infer, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { authMutation, authQuery } from "./function";
import { ShotFields } from "./schema";

export const ListShotArgsValidator = v.object({
  sceneId: ShotFields.sceneId,
});

export const CreateShotArgsValidator = v.object({
  title: ShotFields.title,
  order: ShotFields.order,
  sceneId: ShotFields.sceneId,
  duration: ShotFields.duration,
});

export const UpdateShotArgsValidator = v.object({
  id: v.id("shot"),
  title: v.optional(ShotFields.title),
  order: v.optional(ShotFields.order),
  duration: v.optional(ShotFields.duration),
  selectedFirstFrame: v.optional(ShotFields.selectedFirstFrame),
  selectedVideoClip: v.optional(ShotFields.selectedVideoClip),
});

export const AddShotFirstFramesArgsValidator = v.object({
  id: v.id("shot"),
  imageIds: v.array(v.id("image")),
});

export const AddShotVideoClipsArgsValidator = v.object({
  id: v.id("shot"),
  videoIds: v.array(v.id("video")),
});

export const getShotByIdHandler = (ctx: QueryCtx, id: Id<"shot">) => {
  return ctx.db.get(id);
};

export const listShotsHandler = async (
  ctx: QueryCtx,
  options: Infer<typeof ListShotArgsValidator>,
) => {
  const shots = await ctx.db
    .query("shot")
    .withIndex("by_scene_id", (q) => q.eq("sceneId", options.sceneId))
    .collect();

  return shots.sort((a, b) => a.order - b.order);
};

export const createShotHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof CreateShotArgsValidator>,
) => {
  const shotId = await ctx.db.insert("shot", {
    ...options,
    firstFrames: [],
    videoClips: [],
  });

  return { shotId };
};

export const updateShotHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof UpdateShotArgsValidator>,
) => {
  const { id, ...fields } = options;
  await ctx.db.patch(id, fields);
};

export const addShotFirstFramesHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof AddShotFirstFramesArgsValidator>,
) => {
  const shot = await ctx.db.get(options.id);
  if (!shot) throw new Error("Shot not found");

  const firstFrames = shot.firstFrames ?? [];
  await ctx.db.patch(options.id, {
    firstFrames: [...firstFrames, ...options.imageIds],
  });
};

export const addShotVideoClipsHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof AddShotVideoClipsArgsValidator>,
) => {
  const shot = await ctx.db.get(options.id);
  if (!shot) throw new Error("Shot not found");

  const videoClips = shot.videoClips ?? [];
  await ctx.db.patch(options.id, {
    videoClips: [...videoClips, ...options.videoIds],
  });
};

export const get = authQuery({
  args: { id: v.id("shot") },
  handler: (ctx, args) => getShotByIdHandler(ctx, args.id),
});

export const list = authQuery({
  args: ListShotArgsValidator,
  handler: (ctx, args) => listShotsHandler(ctx, args),
});

export const create = authMutation({
  args: CreateShotArgsValidator,
  handler: (ctx, args) => createShotHandler(ctx, args),
});

export const update = authMutation({
  args: UpdateShotArgsValidator,
  handler: (ctx, args) => updateShotHandler(ctx, args),
});

export const addFirstFrames = authMutation({
  args: AddShotFirstFramesArgsValidator,
  handler: (ctx, args) => addShotFirstFramesHandler(ctx, args),
});

export const addVideoClips = authMutation({
  args: AddShotVideoClipsArgsValidator,
  handler: (ctx, args) => addShotVideoClipsHandler(ctx, args),
});

export const remove = authMutation({
  args: { id: v.id("shot") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
