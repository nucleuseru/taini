import { paginationOptsValidator } from "convex/server";
import { Infer, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { authMutation, authQuery } from "./function";
import { VoiceFields } from "./schema";
import { sortOrderValidator } from "./utils";

export const ListVoiceArgsValidator = v.object({
  projectId: VoiceFields.projectId,
  sort: v.optional(sortOrderValidator),
  paginationOpts: paginationOptsValidator,
});

export const CloneVoiceArgsValidator = v.object({
  name: v.string(),
  transcript: v.string(),
  referenceAudio: v.id("audio"),
  projectId: VoiceFields.projectId,
});

export const UploadVoiceArgsValidator = v.object({
  name: v.string(),
  storageId: v.id("_storage"),
  projectId: VoiceFields.projectId,
});

export const getVoiceByIdHandler = async (ctx: QueryCtx, id: Id<"voice">) => {
  const voice = await ctx.db.get("voice", id);
  if (!voice) return null;
  const url = voice.storageId && (await ctx.storage.getUrl(voice.storageId));
  return { ...voice, url };
};

export const listVoicesHandler = async (
  ctx: QueryCtx,
  options: Infer<typeof ListVoiceArgsValidator>,
) => {
  const voices = await ctx.db
    .query("voice")
    .withIndex("by_project_id", (q) => q.eq("projectId", options.projectId))
    .order(options.sort ?? "asc")
    .paginate(options.paginationOpts);

  const page = await Promise.all(
    voices.page.map(async (voice) => {
      const url =
        voice.storageId && (await ctx.storage.getUrl(voice.storageId));

      return { ...voice, url };
    }),
  );

  return { ...voices, page };
};

export const get = authQuery({
  args: { id: v.id("voice") },
  handler: (ctx, args) => getVoiceByIdHandler(ctx, args.id),
});

export const list = authQuery({
  args: ListVoiceArgsValidator,
  handler: (ctx, args) => listVoicesHandler(ctx, args),
});

export const clone = authMutation({
  args: CloneVoiceArgsValidator,
  handler: async (ctx, args) => {
    const voiceId = await ctx.db.insert("voice", {
      ...args,
      status: "pending",
    });

    return { voiceId };
  },
});

export const upload = authMutation({
  args: UploadVoiceArgsValidator,
  handler: async (ctx, args) => {
    const voiceId = await ctx.db.insert("voice", {
      ...args,
      uploaded: true,
    });

    return { voiceId };
  },
});
