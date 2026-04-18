import { paginationOptsValidator } from "convex/server";
import { Infer, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { authMutation, authQuery } from "./function";
import { AudioFields } from "./schema";
import { sortOrderValidator } from "./utils";

export const ListAudioArgsValidator = v.object({
  projectId: AudioFields.projectId,
  sort: v.optional(sortOrderValidator),
  paginationOpts: paginationOptsValidator,
});

export const GenerateAudioArgsValidator = v.object({
  title: v.string(),
  referenceVoice: v.id("voice"),
  projectId: AudioFields.projectId,
  transcript: AudioFields.transcript,
});

export const UploadAudioArgsValidator = v.object({
  title: v.string(),
  storageId: v.id("_storage"),
  projectId: AudioFields.projectId,
});

export const getAudioByIdHandler = async (ctx: QueryCtx, id: Id<"audio">) => {
  const audio = await ctx.db.get("audio", id);
  if (!audio) return null;
  const url = audio.storageId && (await ctx.storage.getUrl(audio.storageId));
  return { ...audio, url };
};

export const listAudiosHandler = async (
  ctx: QueryCtx,
  options: Infer<typeof ListAudioArgsValidator>,
) => {
  const audios = await ctx.db
    .query("audio")
    .withIndex("by_project_id", (q) => q.eq("projectId", options.projectId))
    .order(options.sort ?? "asc")
    .paginate(options.paginationOpts);

  const page = await Promise.all(
    audios.page.map(async (audio) => {
      const url =
        audio.storageId && (await ctx.storage.getUrl(audio.storageId));

      return { ...audio, url };
    }),
  );

  return { ...audios, page };
};

export const generateAudioHandler = async (
  ctx: MutationCtx,
  options: Infer<typeof GenerateAudioArgsValidator>,
) => {
  const audioId = await ctx.db.insert("audio", {
    ...options,
    status: "pending",
  });

  return { audioId };
};

export const get = authQuery({
  args: { id: v.id("audio") },
  handler: (ctx, args) => getAudioByIdHandler(ctx, args.id),
});

export const list = authQuery({
  args: ListAudioArgsValidator,
  handler: (ctx, args) => listAudiosHandler(ctx, args),
});

export const generate = authMutation({
  args: GenerateAudioArgsValidator,
  handler: (ctx, args) => generateAudioHandler(ctx, args),
});

export const upload = authMutation({
  args: UploadAudioArgsValidator,
  handler: async (ctx, args) => {
    const audioId = await ctx.db.insert("audio", {
      ...args,
      uploaded: true,
      transcriptionStatus: "pending",
    });

    return { audioId };
  },
});
