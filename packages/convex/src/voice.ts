import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { authMutation, authQuery } from "./function";
import { VoiceFields } from "./schema";

export const get = authQuery({
  args: {
    voiceId: v.id("voice"),
  },
  handler: async (ctx, args) => {
    const voice = await ctx.db.get("voice", args.voiceId);

    if (!voice) return;

    const url = voice.storageId && (await ctx.storage.getUrl(voice.storageId));

    return { ...voice, url };
  },
});

export const list = authQuery({
  args: {
    projectId: VoiceFields.projectId,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const voices = await ctx.db
      .query("voice")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      voices.page.map(async (voice) => {
        const url =
          voice.storageId && (await ctx.storage.getUrl(voice.storageId));

        return { ...voice, url };
      }),
    );

    return { ...voices, page };
  },
});

export const clone = authMutation({
  args: {
    name: v.string(),
    transcript: v.string(),
    referenceAudio: v.id("audio"),
    projectId: VoiceFields.projectId,
  },
  handler: async (ctx, args) => {
    const voiceId = await ctx.db.insert("voice", {
      ...args,
      status: "pending",
    });

    return { voiceId };
  },
});

export const upload = authMutation({
  args: {
    name: v.string(),
    storageId: v.id("_storage"),
    projectId: VoiceFields.projectId,
  },
  handler: async (ctx, args) => {
    const voiceId = await ctx.db.insert("voice", {
      ...args,
      uploaded: true,
    });

    return { voiceId };
  },
});
