import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { CharacterFields } from "./schema";

export const get = authQuery({
  args: { characterId: v.id("character") },
  handler: (ctx, args) => {
    return ctx.db.get(args.characterId);
  },
});

export const list = authQuery({
  args: { projectId: CharacterFields.projectId },
  handler: (ctx, args) => {
    return ctx.db
      .query("character")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const create = authMutation({
  args: {
    age: CharacterFields.age,
    name: CharacterFields.name,
    voice: CharacterFields.voice,
    projectId: CharacterFields.projectId,
    appearance: CharacterFields.appearance,
    description: CharacterFields.description,
    personality: CharacterFields.personality,
  },
  handler: async (ctx, args) => {
    const characterId = await ctx.db.insert("character", {
      ...args,
      referenceImages: [],
    });

    return { characterId };
  },
});

export const update = authMutation({
  args: {
    age: CharacterFields.age,
    voice: CharacterFields.voice,
    characterId: v.id("character"),
    name: v.optional(CharacterFields.name),
    appearance: CharacterFields.appearance,
    description: CharacterFields.description,
    personality: CharacterFields.personality,
  },
  handler: async (ctx, args) => {
    const { characterId, ...fields } = args;
    await ctx.db.patch(characterId, fields);
  },
});

export const remove = authMutation({
  args: { characterId: v.id("character") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.characterId);
  },
});

export const addReferenceImage = authMutation({
  args: {
    characterId: v.id("character"),
    ...CharacterFields.referenceImages.element.fields,
  },
  handler: async (ctx, args) => {
    const { characterId, ...imageRef } = args;
    const character = await ctx.db.get(characterId);
    if (!character) throw new Error("Character not found");

    await ctx.db.patch(characterId, {
      referenceImages: [...character.referenceImages, imageRef],
    });
  },
});
