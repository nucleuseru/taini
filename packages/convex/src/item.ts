import { Infer, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { authMutation, authQuery } from "./function";
import { ItemFields } from "./schema";

export const ListItemArgsValidator = v.object({
  projectId: ItemFields.projectId,
});

export const CreateItemArgsValidator = v.object({
  name: ItemFields.name,
  projectId: ItemFields.projectId,
  description: ItemFields.description,
});

export const UpdateItemArgsValidator = v.object({
  id: v.id("item"),
  name: v.optional(ItemFields.name),
  description: v.optional(ItemFields.description),
});

export const AddItemReferenceImagesArgsValidator = v.object({
  id: v.id("item"),
  images: v.array(v.object(ItemFields.referenceImages.element.fields)),
});

export const RemoveItemReferenceImageArgsValidator = v.object({
  id: v.id("item"),
  imageId: v.id("image"),
});

export const getItemByIdHandler = (ctx: QueryCtx, id: Id<"item">) => {
  return ctx.db.get(id);
};

export const listItemsHandler = (
  ctx: QueryCtx,
  options: Infer<typeof ListItemArgsValidator>,
) => {
  return ctx.db
    .query("item")
    .withIndex("by_project_id", (q) => q.eq("projectId", options.projectId))
    .collect();
};

export const createItemHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof CreateItemArgsValidator>,
) => {
  const itemId = await ctx.db.insert("item", {
    ...options,
    referenceImages: [],
  });
  return { itemId };
};

export const updateItemHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof UpdateItemArgsValidator>,
) => {
  const { id, ...fields } = options;
  await ctx.db.patch(id, fields);
};

export const addItemReferenceImagesHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof AddItemReferenceImagesArgsValidator>,
) => {
  const { id, images } = options;
  const item = await ctx.db.get(id);
  if (!item) throw new Error("Item not found");

  await ctx.db.patch(id, {
    referenceImages: [...item.referenceImages, ...images],
  });
};

export const removeItemReferenceImageHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof RemoveItemReferenceImageArgsValidator>,
) => {
  const { id, imageId } = options;
  const item = await ctx.db.get(id);
  if (!item) throw new Error("Item not found");

  const image = await ctx.db.get(imageId);
  if (image) {
    if (image.storageId) {
      await ctx.storage.delete(image.storageId);
    }
    await ctx.db.delete(imageId);
  }

  await ctx.db.patch(id, {
    referenceImages: item.referenceImages.filter(
      (ref) => ref.imageId !== imageId,
    ),
  });
};

export const get = authQuery({
  args: { id: v.id("item") },
  handler: (ctx, args) => getItemByIdHandler(ctx, args.id),
});

export const list = authQuery({
  args: ListItemArgsValidator,
  handler: (ctx, args) => listItemsHandler(ctx, args),
});

export const create = authMutation({
  args: CreateItemArgsValidator,
  handler: (ctx, args) => createItemHandler(ctx, args),
});

export const update = authMutation({
  args: UpdateItemArgsValidator,
  handler: (ctx, args) => updateItemHandler(ctx, args),
});

export const addReferenceImages = authMutation({
  args: AddItemReferenceImagesArgsValidator,
  handler: (ctx, args) => addItemReferenceImagesHandler(ctx, args),
});

export const removeReferenceImage = authMutation({
  args: RemoveItemReferenceImageArgsValidator,
  handler: (ctx, args) => removeItemReferenceImageHandler(ctx, args),
});

export const remove = authMutation({
  args: { id: v.id("item") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
