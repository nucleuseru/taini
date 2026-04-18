import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { ImageFields } from "./schema";

export const get = authQuery({
  args: { id: v.id("image") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get("image", args.id);

    if (!image) return;

    const url = image.storageId && (await ctx.storage.getUrl(image.storageId));

    return { ...image, url };
  },
});

export const list = authQuery({
  args: {
    projectId: ImageFields.projectId,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("image")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      images.page.map(async (image) => {
        const url =
          image.storageId && (await ctx.storage.getUrl(image.storageId));

        return { ...image, url };
      }),
    );

    return { ...images, page };
  },
});

export const generate = authMutation({
  args: {
    prompt: v.string(),
    projectId: ImageFields.projectId,
    resolution: ImageFields.resolution,
    illustration: ImageFields.illustration,
    referenceImages: ImageFields.referenceImages,
  },
  handler: async (ctx, args) => {
    const imageId = await ctx.db.insert("image", {
      ...args,
      status: "pending",
    });

    return { imageId };
  },
});

export const upload = authMutation({
  args: {
    storageId: v.id("_storage"),
    projectId: ImageFields.projectId,
    illustration: ImageFields.illustration,
  },
  handler: async (ctx, args) => {
    const imageId = await ctx.db.insert("image", { ...args, uploaded: true });

    return { imageId };
  },
});
