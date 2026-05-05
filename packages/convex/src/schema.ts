import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { generationStatusValidator, optional } from "./utils";

export const ProjectFields = {
  userId: v.string(),
  name: v.string(),
};

export const ImageFields = {
  projectId: v.id("project"),
  jobId: optional(v.string()),
  prompt: optional(v.string()),
  seed: optional(v.number()),
  width: optional(v.number()),
  height: optional(v.number()),
  uploaded: optional(v.boolean()),
  illustration: optional(v.boolean()),
  storageId: optional(v.id("_storage")),
  status: optional(generationStatusValidator),
  referenceImages: optional(v.array(v.id("image"))),
};

export const VideoFields = {
  projectId: v.id("project"),
  jobId: optional(v.string()),
  prompt: optional(v.string()),
  seed: optional(v.number()),
  width: optional(v.number()),
  height: optional(v.number()),
  duration: optional(v.number()),
  uploaded: optional(v.boolean()),
  startFrame: optional(v.id("image")),
  endFrame: optional(v.id("image")),
  negativePrompt: optional(v.string()),
  storageId: optional(v.id("_storage")),
  status: optional(generationStatusValidator),
  frameRate: optional(
    v.union(v.literal("24"), v.literal("30"), v.literal("60")),
  ),
};

export const AudioFields = {
  projectId: v.id("project"),
  text: optional(v.string()),
  title: optional(v.string()),
  ttsJobId: optional(v.string()),
  sttJobId: optional(v.string()),
  uploaded: optional(v.boolean()),
  storageId: optional(v.id("_storage")),
  referenceVoice: optional(v.id("voice")),
  ttsStatus: optional(generationStatusValidator),
  sttStatus: optional(generationStatusValidator),
  timestamps: optional(
    v.array(
      v.object({
        text: v.string(),
        start: v.number(),
        end: v.number(),
      }),
    ),
  ),
};

export const VoiceFields = {
  projectId: v.id("project"),
  name: v.string(),
  jobId: optional(v.string()),
  uploaded: optional(v.boolean()),
  storageId: optional(v.id("_storage")),
  referenceAudio: optional(v.id("audio")),
  status: optional(generationStatusValidator),
};

export const CharacterFields = {
  projectId: v.id("project"),
  name: v.string(),
  description: optional(v.string()),
  personality: optional(v.string()),
  appearance: optional(v.string()),
  age: optional(v.string()),
  referenceImages: v.array(
    v.object({
      name: v.string(),
      description: optional(v.string()),
      imageId: v.id("image"),
    }),
  ),
};

export const ItemFields = {
  projectId: v.id("project"),
  name: v.string(),
  description: optional(v.string()),
  referenceImages: v.array(
    v.object({
      name: v.string(),
      description: optional(v.string()),
      imageId: v.id("image"),
    }),
  ),
};

export const EnvironmentFields = {
  projectId: v.id("project"),
  name: v.string(),
  description: optional(v.string()),
  referenceImages: v.array(
    v.object({
      name: v.string(),
      description: optional(v.string()),
      imageId: v.id("image"),
    }),
  ),
};

export const ShotFields = {
  sceneId: v.id("scene"),
  title: v.string(),
  description: v.string(),
  order: v.number(),
  duration: v.number(),
  startFrames: optional(v.array(v.id("image"))),
  endFrames: optional(v.array(v.id("image"))),
  selectedStartFrame: optional(v.id("image")),
  selectedEndFrame: optional(v.id("image")),
  videoClips: optional(v.array(v.id("video"))),
  selectedVideoClip: optional(v.id("video")),
};

export const SceneFields = {
  storyboardId: v.id("storyboard"),
  order: v.number(),
  title: v.string(),
  description: v.string(),
};

export const StoryboardFields = {
  projectId: v.id("project"),
  script: v.string(),
  threadId: optional(v.string()),
  style: optional(v.string()),
  width: optional(v.number()),
  height: optional(v.number()),
  audio: optional(v.boolean()),
  referenceStyle: optional(v.id("image")),
  frameRate: optional(
    v.union(v.literal("24"), v.literal("30"), v.literal("60")),
  ),
};

export const tables = {
  project: defineTable(ProjectFields).index("by_user_id", {
    fields: ["userId"],
  }),

  image: defineTable(ImageFields)
    .index("by_project_id", {
      fields: ["projectId"],
    })
    .index("by_job_id", {
      fields: ["jobId"],
    }),

  video: defineTable(VideoFields)
    .index("by_project_id", {
      fields: ["projectId"],
    })
    .index("by_job_id", {
      fields: ["jobId"],
    }),

  audio: defineTable(AudioFields)
    .index("by_project_id", {
      fields: ["projectId"],
    })
    .index("by_tts_job_id", {
      fields: ["ttsJobId"],
    })
    .index("by_stt_job_id", {
      fields: ["sttJobId"],
    }),

  voice: defineTable(VoiceFields)
    .index("by_project_id", {
      fields: ["projectId"],
    })
    .index("by_job_id", {
      fields: ["jobId"],
    }),

  character: defineTable(CharacterFields).index("by_project_id", {
    fields: ["projectId"],
  }),

  item: defineTable(ItemFields).index("by_project_id", {
    fields: ["projectId"],
  }),

  environment: defineTable(EnvironmentFields).index("by_project_id", {
    fields: ["projectId"],
  }),

  shot: defineTable(ShotFields).index("by_scene_id", { fields: ["sceneId"] }),

  scene: defineTable(SceneFields).index("by_storyboard_id", {
    fields: ["storyboardId"],
  }),

  storyboard: defineTable(StoryboardFields).index("by_project_id", {
    fields: ["projectId"],
  }),
};

export default defineSchema(tables);
