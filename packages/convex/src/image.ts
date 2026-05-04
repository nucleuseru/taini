import { paginationOptsValidator } from "convex/server";
import { ConvexError, Infer, v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  httpAction,
  internalAction,
  internalQuery,
  MutationCtx,
  QueryCtx,
} from "./_generated/server";
import { authMutation, authQuery, internalMutation } from "./function";
import { ImageFields } from "./schema";
import { triggers } from "./triggers";
import { generateRandomInt, RunPodData, sortOrderValidator } from "./utils";

export const ListImageArgsValidator = v.object({
  projectId: ImageFields.projectId,
  sort: v.optional(sortOrderValidator),
  uploaded: v.optional(v.boolean()),
  illustration: v.optional(v.boolean()),
  paginationOpts: paginationOptsValidator,
});

export const GenerateImageArgsValidator = v.object({
  prompt: v.string(),
  width: ImageFields.width,
  height: ImageFields.height,
  projectId: ImageFields.projectId,
  illustration: ImageFields.illustration,
  referenceImages: ImageFields.referenceImages,
});

export const UploadImageArgsValidator = v.object({
  storageId: v.id("_storage"),
  projectId: ImageFields.projectId,
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
    .filter((q) =>
      q.and(
        q.eq(q.field("uploaded"), options.uploaded ?? undefined),
        q.eq(q.field("illustration"), options.illustration ?? undefined),
      ),
    )
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
    seed: generateRandomInt(4_000_000_000),
  });

  return { imageId };
};

export const get = authQuery({
  args: { id: v.id("image") },
  handler: (ctx, args) => getImageByIdHandler(ctx, args.id),
});

export const getMany = authQuery({
  args: { ids: v.array(v.id("image")) },
  handler: async (ctx, args) => {
    const images = await Promise.all(
      args.ids.map((id) => getImageByIdHandler(ctx, id)),
    );
    return images.filter((img) => img !== null);
  },
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

export const removeImageHandler = async (ctx: MutationCtx, id: Id<"image">) => {
  const image = await ctx.db.get(id);
  if (!image) return;
  if (image.storageId) {
    await ctx.storage.delete(image.storageId);
  }
  await ctx.db.delete(id);
};

export const remove = authMutation({
  args: { id: v.id("image") },
  handler: (ctx, args) => removeImageHandler(ctx, args.id),
});

export const triggerInference = authMutation({
  args: { id: v.id("image") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.id);

    if (!image?.storageId) {
      await ctx.db.patch(args.id, { status: "queued" });
    }
  },
});

export const getByJobId = internalQuery({
  args: { jobId: v.string() },
  handler: (ctx, args) => {
    return ctx.db
      .query("image")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .unique();
  },
});

export const update = internalMutation({
  args: {
    id: v.id("image"),
    jobId: ImageFields.jobId,
    storageId: ImageFields.storageId,
    status: ImageFields.status,
  },
  handler: (ctx, args) => {
    const { id, ...rest } = args;
    return ctx.db.patch(id, rest);
  },
});

export const inference = internalAction({
  args: {
    id: v.id("image"),
    prompt: v.string(),
    seed: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    input_images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id: imageId, ...input } = args;

    const response = await fetch(
      "https://api.runpod.ai/v2/6cqbgvah21o4vh/run",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RUNPOD_API_KEY ?? ""}`,
        },
        body: JSON.stringify({
          input,
          webhook: `${process.env.CONVEX_SITE_URL ?? ""}/webhook/image`,
        }),
      },
    );

    if (!response.ok) {
      throw new ConvexError(
        `HTTP error! status: ${response.status.toString()}`,
      );
    }

    const data = (await response.json()) as RunPodData;

    await ctx.runMutation(internal.image.update, {
      id: imageId,
      jobId: data.id,
      status: "generating",
    });
  },
});

export const webhook = httpAction(async (ctx, request) => {
  const data = (await request.json()) as RunPodData<{
    storage_ids: Id<"_storage">[];
  }>;

  const image = await ctx.runQuery(internal.image.getByJobId, {
    jobId: data.id,
  });

  if (!image) return new Response();

  if (data.status === "COMPLETED") {
    await ctx.runMutation(internal.image.update, {
      id: image._id,
      status: "completed",
      storageId: data.output.storage_ids[0],
    });
  } else {
    await ctx.runMutation(internal.image.update, {
      id: image._id,
      status: "failed",
    });
  }

  return new Response();
});

triggers.register("image", async (ctx, change) => {
  if (change.operation !== "update") return;
  if (change.newDoc.status !== "queued") return;

  if (!change.newDoc.prompt?.trim()) {
    await ctx.db.patch(change.id, { status: "pending" });
    return;
  }

  const input_images = await Promise.all(
    change.newDoc.referenceImages?.map(async (imageId) => {
      const image = await getImageByIdHandler(ctx, imageId);

      if (image?.storageId) {
        const imageUrl = await ctx.storage.getUrl(image.storageId);
        return imageUrl;
      }
    }) ?? [],
  );

  await ctx.scheduler.runAfter(0, internal.image.inference, {
    id: change.id,
    prompt: change.newDoc.prompt,
    seed: change.newDoc.seed ?? undefined,
    width: change.newDoc.width ?? undefined,
    height: change.newDoc.height ?? undefined,
    input_images: input_images.filter((img): img is string => !!img),
  });
});
