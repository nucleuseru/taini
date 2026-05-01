import { process } from "better-auth";
import { paginationOptsValidator } from "convex/server";
import { Infer, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalAction, MutationCtx, QueryCtx } from "./_generated/server";
import { authMutation, authQuery } from "./function";
import { ImageFields } from "./schema";
import { triggers } from "./triggers";
import { sortOrderValidator } from "./utils";

export const ListImageArgsValidator = v.object({
  projectId: ImageFields.projectId,
  sort: v.optional(sortOrderValidator),
  paginationOpts: paginationOptsValidator,
});

export const GenerateImageArgsValidator = v.object({
  prompt: v.string(),
  seed: ImageFields.seed,
  width: ImageFields.width,
  height: ImageFields.height,
  projectId: ImageFields.projectId,
  illustration: ImageFields.illustration,
  referenceImages: ImageFields.referenceImages,
});

export const UploadImageArgsValidator = v.object({
  storageId: v.id("_storage"),
  projectId: ImageFields.projectId,
  illustration: ImageFields.illustration,
});

export const getImageByIdHandler = async (ctx: QueryCtx, id: Id<"image">) => {
  const image = await ctx.db.get("image", id);
  if (!image) return null;
  const url = image.storageId && (await ctx.storage.getUrl(image.storageId));
  return { ...image, url };
};

export const listImagesHandler = async (
  ctx: QueryCtx,
  options: Infer<typeof ListImageArgsValidator>,
) => {
  const images = await ctx.db
    .query("image")
    .withIndex("by_project_id", (q) => q.eq("projectId", options.projectId))
    .order(options.sort ?? "desc")
    .paginate(options.paginationOpts);

  const page = await Promise.all(
    images.page.map(async (image) => {
      const url =
        image.storageId && (await ctx.storage.getUrl(image.storageId));

      return { ...image, url };
    }),
  );

  return { ...images, page };
};

export const generateImageHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof GenerateImageArgsValidator>,
) => {
  const imageId = await ctx.db.insert("image", {
    ...options,
    status: "pending",
  });

  return { imageId };
};

export const get = authQuery({
  args: { id: v.id("image") },
  handler: (ctx, args) => getImageByIdHandler(ctx, args.id),
});

export const list = authQuery({
  args: ListImageArgsValidator,
  handler: (ctx, args) => listImagesHandler(ctx, args),
});

export const generate = authMutation({
  args: GenerateImageArgsValidator,
  handler: (ctx, args) => generateImageHandler(ctx, args),
});

export const upload = authMutation({
  args: UploadImageArgsValidator,
  handler: async (ctx, args) => {
    const imageId = await ctx.db.insert("image", { ...args, uploaded: true });
    return { imageId };
  },
});

export const inference = internalAction({
  args: {
    prompt: v.string(),
    seed: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    input_images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const endpoint = "https://api.runpod.ai/v2/6cqbgvah21o4vh/run";

    const requestConfig = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
      body: JSON.stringify({ input: args }),
    };

    try {
      const response = await fetch(endpoint, requestConfig);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },
});

triggers.register("image", async (ctx, change) => {
  if (change.operation !== "update") return;
  if (change.newDoc.status !== "queued") return;
});
