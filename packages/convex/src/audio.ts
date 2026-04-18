import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { AudioFields } from "./schema";

export const get = authQuery({
  args: { id: v.id("audio") },
  handler: async (ctx, args) => {
    const audio = await ctx.db.get("audio", args.id);

    if (!audio) return;

    const url = audio.storageId && (await ctx.storage.getUrl(audio.storageId));

    return { ...audio, url };
  },
});

export const list = authQuery({
  args: {
    projectId: AudioFields.projectId,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const audios = await ctx.db
      .query("audio")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      audios.page.map(async (audio) => {
        const url =
          audio.storageId && (await ctx.storage.getUrl(audio.storageId));

        return { ...audio, url };
      }),
    );

    return { ...audios, page };
  },
});

export const generate = authMutation({
  args: {
    title: v.string(),
    referenceVoice: v.id("voice"),
    projectId: AudioFields.projectId,
    transcript: AudioFields.transcript,
  },
  handler: async (ctx, args) => {
    const audioId = await ctx.db.insert("audio", {
      ...args,
      status: "pending",
    });

    return { audioId };
  },
});

export const upload = authMutation({
  args: {
    title: v.string(),
    storageId: v.id("_storage"),
    projectId: AudioFields.projectId,
  },
  handler: async (ctx, args) => {
    const audioId = await ctx.db.insert("audio", {
      ...args,
      uploaded: true,
      transcriptionStatus: "pending",
    });

    return { audioId };
  },
});
