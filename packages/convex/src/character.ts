import { Infer, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { authMutation, authQuery } from "./function";
import { CharacterFields } from "./schema";

export const ListCharacterArgsValidator = v.object({
  projectId: CharacterFields.projectId,
});

export const CreateCharacterArgsValidator = v.object({
  age: CharacterFields.age,
  name: CharacterFields.name,
  voice: CharacterFields.voice,
  projectId: CharacterFields.projectId,
  appearance: CharacterFields.appearance,
  description: CharacterFields.description,
  personality: CharacterFields.personality,
});

export const UpdateCharacterArgsValidator = v.object({
  id: v.id("character"),
  age: v.optional(CharacterFields.age),
  voice: v.optional(CharacterFields.voice),
  name: v.optional(CharacterFields.name),
  appearance: v.optional(CharacterFields.appearance),
  description: v.optional(CharacterFields.description),
  personality: v.optional(CharacterFields.personality),
});

export const AddCharacterReferenceImagesArgsValidator = v.object({
  id: v.id("character"),
  images: v.array(v.object(CharacterFields.referenceImages.element.fields)),
});

export const getCharacterByIdHandler = (ctx: QueryCtx, id: Id<"character">) => {
  return ctx.db.get(id);
};

export const listCharactersHandler = (
  ctx: QueryCtx,
  options: Infer<typeof ListCharacterArgsValidator>,
) => {
  return ctx.db
    .query("character")
    .withIndex("by_project_id", (q) => q.eq("projectId", options.projectId))
    .collect();
};

export const createCharacterHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof CreateCharacterArgsValidator>,
) => {
  const characterId = await ctx.db.insert("character", {
    ...options,
    referenceImages: [],
  });

  return { characterId };
};

export const updateCharacterHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof UpdateCharacterArgsValidator>,
) => {
  const { id, ...fields } = options;
  await ctx.db.patch(id, fields);
};

export const addCharacterReferenceImagesHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof AddCharacterReferenceImagesArgsValidator>,
) => {
  const { id, images } = options;
  const character = await ctx.db.get(id);
  if (!character) throw new Error("Character not found");

  await ctx.db.patch(id, {
    referenceImages: [...character.referenceImages, ...images],
  });
};

export const get = authQuery({
  args: { id: v.id("character") },
  handler: (ctx, args) => getCharacterByIdHandler(ctx, args.id),
});

export const list = authQuery({
  args: ListCharacterArgsValidator,
  handler: (ctx, args) => listCharactersHandler(ctx, args),
});

export const create = authMutation({
  args: CreateCharacterArgsValidator,
  handler: (ctx, args) => createCharacterHandler(ctx, args),
});

export const update = authMutation({
  args: UpdateCharacterArgsValidator,
  handler: (ctx, args) => updateCharacterHandler(ctx, args),
});

export const addReferenceImages = authMutation({
  args: AddCharacterReferenceImagesArgsValidator,
  handler: (ctx, args) => addCharacterReferenceImagesHandler(ctx, args),
});

export const remove = authMutation({
  args: { id: v.id("character") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
