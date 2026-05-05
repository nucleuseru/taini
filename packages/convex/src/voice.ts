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
import { VoiceFields } from "./schema";
import { triggers } from "./triggers";
import { RunPodData, sortOrderValidator } from "./utils";

export const ListVoiceArgsValidator = v.object({
  projectId: VoiceFields.projectId,
  sort: v.optional(sortOrderValidator),
  paginationOpts: paginationOptsValidator,
});

export const CloneVoiceArgsValidator = v.object({
  name: v.string(),
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
    .order(options.sort ?? "desc")
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
      status: "queued",
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

export const removeVoiceHandler = async (ctx: MutationCtx, id: Id<"voice">) => {
  const voice = await ctx.db.get(id);
  if (!voice) return;
  if (voice.storageId) {
    await ctx.storage.delete(voice.storageId);
  }
  await ctx.db.delete(id);
};

export const remove = authMutation({
  args: { id: v.id("voice") },
  handler: (ctx, args) => removeVoiceHandler(ctx, args.id),
});

export const triggerInference = authMutation({
  args: { id: v.id("voice") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "queued" });
  },
});

export const getByJobId = internalQuery({
  args: { jobId: v.string() },
  handler: (ctx, args) => {
    return ctx.db
      .query("voice")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .unique();
  },
});

export const update = internalMutation({
  args: {
    id: v.id("voice"),
    jobId: VoiceFields.jobId,
    storageId: VoiceFields.storageId,
    status: VoiceFields.status,
  },
  handler: (ctx, args) => {
    const { id, ...rest } = args;
    return ctx.db.patch(id, rest);
  },
});

export const inference = internalAction({
  args: {
    id: v.id("voice"),
    ref_audio: v.string(),
    ref_text: v.optional(v.string()),
    x_vector_only_mode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id: voiceId, ...input } = args;

    const response = await fetch(
      "https://api.runpod.ai/v2/w6qbk3oyegwstr/run",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RUNPOD_API_KEY ?? ""}`,
        },
        body: JSON.stringify({
          input: { ...input, task: "create_prompt" },
          webhook: `${process.env.CONVEX_SITE_URL ?? ""}/webhook/voice`,
        }),
      },
    );

    if (!response.ok) {
      throw new ConvexError(
        `HTTP error! status: ${response.status.toString()}`,
      );
    }

    const data = (await response.json()) as RunPodData;

    await ctx.runMutation(internal.voice.update, {
      id: voiceId,
      jobId: data.id,
      status: "generating",
    });
  },
});

export const webhook = httpAction(async (ctx, request) => {
  const data = (await request.json()) as RunPodData<{
    storage_ids: Id<"_storage">[];
  }>;

  const voice = await ctx.runQuery(internal.voice.getByJobId, {
    jobId: data.id,
  });

  if (!voice) return new Response();

  if (data.status === "COMPLETED") {
    await ctx.runMutation(internal.voice.update, {
      id: voice._id,
      status: "completed",
      storageId: data.output.storage_ids[0],
    });
  } else {
    await ctx.runMutation(internal.voice.update, {
      id: voice._id,
      status: "failed",
    });
  }

  return new Response();
});

triggers.register("voice", async (ctx, change) => {
  if (change.operation === "delete") return;
  if (change.newDoc.status !== "queued") return;

  if (change.newDoc.storageId) {
    await ctx.db.patch(change.id, { status: "completed" });
    return;
  }

  const audio = change.newDoc.referenceAudio
    ? await ctx.db.get("audio", change.newDoc.referenceAudio)
    : null;

  const audioUrl = audio?.storageId
    ? await ctx.storage.getUrl(audio.storageId)
    : null;

  if (audioUrl) {
    await ctx.scheduler.runAfter(0, internal.voice.inference, {
      id: change.id,
      ref_audio: audioUrl,
      x_vector_only_mode: !audio?.text,
      ref_text: audio?.text ?? undefined,
    });
  } else {
    await ctx.db.patch(change.id, { status: "failed" });
  }
});
