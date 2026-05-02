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
import { AudioFields } from "./schema";
import { triggers } from "./triggers";
import { RunPodData, sortOrderValidator } from "./utils";

export const ListAudioArgsValidator = v.object({
  projectId: AudioFields.projectId,
  sort: v.optional(sortOrderValidator),
  paginationOpts: paginationOptsValidator,
});

export const GenerateAudioArgsValidator = v.object({
  title: v.string(),
  text: v.string(),
  referenceVoice: v.id("voice"),
  projectId: AudioFields.projectId,
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
    .order(options.sort ?? "desc")
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
    ttsStatus: "pending",
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
      sttStatus: "queued",
    });

    return { audioId };
  },
});

export const getByTtsJobId = internalQuery({
  args: { jobId: v.string() },
  handler: (ctx, args) => {
    return ctx.db
      .query("audio")
      .withIndex("by_tts_job_id", (q) => q.eq("ttsJobId", args.jobId))
      .unique();
  },
});

export const getBySttJobId = internalQuery({
  args: { jobId: v.string() },
  handler: (ctx, args) => {
    return ctx.db
      .query("audio")
      .withIndex("by_stt_job_id", (q) => q.eq("sttJobId", args.jobId))
      .unique();
  },
});

export const update = internalMutation({
  args: {
    id: v.id("audio"),
    text: AudioFields.text,
    ttsJobId: AudioFields.ttsJobId,
    sttJobId: AudioFields.sttJobId,
    ttsStatus: AudioFields.ttsStatus,
    sttStatus: AudioFields.sttStatus,
    storageId: AudioFields.storageId,
    timestamps: AudioFields.timestamps,
  },
  handler: (ctx, args) => {
    const { id, ...rest } = args;
    return ctx.db.patch(id, rest);
  },
});

export const inferenceTts = internalAction({
  args: {
    id: v.id("audio"),
    text: v.string(),
    ref_text: v.optional(v.string()),
    ref_audio: v.optional(v.string()),
    voice_clone_prompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id: audioId, ...input } = args;

    const response = await fetch(
      "https://api.runpod.ai/v2/w6qbk3oyegwstr/run",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RUNPOD_API_KEY ?? ""}`,
        },
        body: JSON.stringify({
          input: { ...input, task: "generate" },
          webhook: `${process.env.CONVEX_SITE_URL ?? ""}/webhook/audio/tts`,
        }),
      },
    );

    if (!response.ok) {
      throw new ConvexError(
        `HTTP error! status: ${response.status.toString()}`,
      );
    }

    const data = (await response.json()) as RunPodData;

    await ctx.runMutation(internal.audio.update, {
      id: audioId,
      ttsJobId: data.id,
      ttsStatus: "generating",
    });
  },
});

export const inferenceStt = internalAction({
  args: {
    id: v.id("audio"),
    audio_url: v.string(),
  },
  handler: async (ctx, args) => {
    const { id: audioId, ...input } = args;

    const response = await fetch(
      "https://api.runpod.ai/v2/xkp0g7rrw838xz/run",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RUNPOD_API_KEY ?? ""}`,
        },
        body: JSON.stringify({
          input,
          webhook: `${process.env.CONVEX_SITE_URL ?? ""}/webhook/audio/stt`,
        }),
      },
    );

    if (!response.ok) {
      throw new ConvexError(
        `HTTP error! status: ${response.status.toString()}`,
      );
    }

    const data = (await response.json()) as RunPodData;

    await ctx.runMutation(internal.audio.update, {
      id: audioId,
      sttJobId: data.id,
      sttStatus: "generating",
    });
  },
});

export const webhookTts = httpAction(async (ctx, request) => {
  const data = (await request.json()) as RunPodData<{
    storage_ids: Id<"_storage">[];
  }>;
  const audio = await ctx.runQuery(internal.audio.getByTtsJobId, {
    jobId: data.id,
  });

  if (!audio) return new Response();

  if (data.status === "COMPLETED") {
    await ctx.runMutation(internal.audio.update, {
      id: audio._id,
      sttStatus: "queued",
      ttsStatus: "completed",
      storageId: data.output.storage_ids[0],
    });
  } else {
    await ctx.runMutation(internal.audio.update, {
      id: audio._id,
      ttsStatus: "failed",
    });
  }

  return new Response();
});

export const webhookStt = httpAction(async (ctx, request) => {
  const data = (await request.json()) as RunPodData<{
    timestamps: Infer<typeof AudioFields.timestamps>;
  }>;
  const audio = await ctx.runQuery(internal.audio.getBySttJobId, {
    jobId: data.id,
  });

  if (!audio) return new Response();

  if (data.status === "COMPLETED") {
    await ctx.runMutation(internal.audio.update, {
      id: audio._id,
      sttStatus: "completed",
      timestamps: data.output.timestamps,
    });
  } else {
    await ctx.runMutation(internal.audio.update, {
      id: audio._id,
      sttStatus: "failed",
    });
  }

  return new Response();
});

triggers.register("audio", async (ctx, change) => {
  if (change.operation !== "update") return;

  // Handle TTS
  if (change.newDoc.ttsStatus === "queued" && change.newDoc.text) {
    const voice = change.newDoc.referenceVoice
      ? await ctx.db.get("voice", change.newDoc.referenceVoice)
      : null;

    const referenceAudioUrl = voice?.storageId
      ? await ctx.storage.getUrl(voice.storageId)
      : null;

    if (referenceAudioUrl) {
      await ctx.scheduler.runAfter(0, internal.audio.inferenceTts, {
        id: change.id,
        text: change.newDoc.text,
        ref_audio: referenceAudioUrl,
      });
    }
  }

  // Handle STT
  if (change.newDoc.sttStatus === "queued" && change.newDoc.storageId) {
    const audioUrl = await ctx.storage.getUrl(change.newDoc.storageId);
    if (audioUrl) {
      await ctx.scheduler.runAfter(0, internal.audio.inferenceStt, {
        id: change.id,
        audio_url: audioUrl,
      });
    }
  }
});
