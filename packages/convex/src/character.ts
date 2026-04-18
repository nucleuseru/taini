import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { CharacterFields } from "./schema";

export const get = authQuery({
  args: { id: v.id("character") },
  handler: (ctx, args) => {
    return ctx.db.get(args.id);
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
    id: v.id("character"),
    age: CharacterFields.age,
    voice: CharacterFields.voice,
    name: v.optional(CharacterFields.name),
    appearance: CharacterFields.appearance,
    description: CharacterFields.description,
    personality: CharacterFields.personality,
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = authMutation({
  args: { id: v.id("character") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const addReferenceImage = authMutation({
  args: {
    id: v.id("character"),
    ...CharacterFields.referenceImages.element.fields,
  },
  handler: async (ctx, args) => {
    const { id, ...imageRef } = args;
    const character = await ctx.db.get(id);
    if (!character) throw new Error("Character not found");

    await ctx.db.patch(id, {
      referenceImages: [...character.referenceImages, imageRef],
    });
  },
});
