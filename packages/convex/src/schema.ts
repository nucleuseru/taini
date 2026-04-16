import { defineSchema, defineTable } from "convex/server";
import { v, Validator } from "convex/values";

const optional = <Type, FieldPaths extends string = never>(
  validator: Validator<Type, "required", FieldPaths>,
) => v.optional(v.nullable(validator));

export const ProjectSchema = {
  userId: v.string(),
  name: v.string(),
  description: optional(v.string()),
};

export const ImageSchema = {
  projectId: v.id("project"),
  prompt: optional(v.string()),
  uploaded: optional(v.boolean()),
  file: optional(v.id("_storage")),
  referenceImages: optional(v.array(v.id("_storage"))),
  illustration: optional(v.boolean()),
  status: optional(v.string()),
};

export const VideoSchema = {
  projectId: v.id("project"),
  prompt: optional(v.string()),
  uploaded: optional(v.boolean()),
  file: optional(v.id("_storage")),
  duration: optional(v.number()),
  referenceAudio: optional(v.id("_storage")),
  referenceVideo: optional(v.id("_storage")),
  referenceImages: optional(v.array(v.id("_storage"))),
  status: optional(v.string()),
};

export const AudioSchema = {
  projectId: v.id("project"),
  uploaded: optional(v.boolean()),
  file: optional(v.id("_storage")),
  transcript: optional(v.string()),
  timestamps: optional(
    v.array(
      v.object({
        word: v.string(),
        start: v.number(),
        end: v.number(),
      }),
    ),
  ),
  status: optional(v.string()),
};

export const VoiceSchema = {
  projectId: v.id("project"),
  name: optional(v.string()),
  uploaded: optional(v.boolean()),
  file: optional(v.id("_storage")),
  status: optional(v.string()),
};

export const CharacterSchema = {
  projectId: v.id("project"),
  name: v.string(),
  description: optional(v.string()),
  personality: optional(v.string()),
  appearance: optional(v.string()),
  voice: optional(v.id("voice")),
  age: optional(v.string()),
  referenceImages: v.array(
    v.object({
      name: v.string(),
      description: optional(v.string()),
      image: v.id("image"),
    }),
  ),
};

export const EnvironmentSchema = {
  projectId: v.id("project"),
  name: v.string(),
  description: optional(v.string()),
  location: optional(v.string()),
  timeOfDay: optional(v.string()),
  weather: optional(v.string()),
  atmosphere: optional(v.string()),
  referenceImages: v.array(
    v.object({
      name: v.string(),
      description: v.string(),
      image: v.id("image"),
    }),
  ),
};

export const ShotSchema = {
  sceneId: v.id("scene"),
  order: v.number(),
  duration: optional(v.number()),
  firstFrames: optional(v.array(v.id("image"))),
  selectedFirstFrame: optional(v.id("image")),
  videoClips: optional(v.array(v.id("video"))),
  selectedVideoClip: optional(v.id("video")),
};

export const SceneSchema = {
  storyboardId: v.id("storyboard"),
  order: v.number(),
  shots: v.array(v.id("shot")),
};

export const StoryboardSchema = {
  projectId: v.id("project"),
  script: optional(v.string()),
  narrative: optional(v.string()),
};

export const tables = {
  project: defineTable(ProjectSchema),
  image: defineTable(ImageSchema),
  video: defineTable(VideoSchema),
  audio: defineTable(AudioSchema),
  voice: defineTable(VoiceSchema),
  character: defineTable(CharacterSchema),
  environment: defineTable(EnvironmentSchema),
  shot: defineTable(ShotSchema),
  scene: defineTable(SceneSchema),
  storyboard: defineTable(StoryboardSchema),
};

export default defineSchema(tables);
