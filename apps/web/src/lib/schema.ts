import { z } from "zod";

export const ERROR_MESSAGE = {
  REQUIRED: "This field is required",
};

export const TTSFormSchema = z.object({
  title: z.string().min(1, ERROR_MESSAGE.REQUIRED),
  text: z.string().min(1, ERROR_MESSAGE.REQUIRED),
  referenceVoice: z.string().min(1, ERROR_MESSAGE.REQUIRED),
});

export const VoiceCloneFormSchema = z.object({
  name: z.string().min(1, ERROR_MESSAGE.REQUIRED),
  referenceAudio: z.string().min(1, ERROR_MESSAGE.REQUIRED),
});

export const CreateProjectFormSchema = z.object({
  name: z.string().min(1, ERROR_MESSAGE.REQUIRED),
});

export const CreateElementFormSchema = z.object({
  type: z.enum(["character", "environment", "item"]),
  name: z.string().min(1, ERROR_MESSAGE.REQUIRED),
  age: z.string(),
  appearance: z.string(),
  description: z.string(),
  personality: z.string(),
});

export const ReferenceImageSchema = z.object({
  name: z.string().min(1, ERROR_MESSAGE.REQUIRED),
  description: z.string().optional(),
});

export const CreateStoryboardFormSchema = z.object({
  script: z.string().min(1, ERROR_MESSAGE.REQUIRED),
  width: z.coerce.number().min(256).max(2048).default(1920),
  height: z.coerce.number().min(256).max(2048).default(1080),
  frameRate: z.enum(["24", "30", "60"]).default("24"),
  style: z.string().optional(),
  audio: z.boolean().default(true),
});

export const AddReferenceSchema = ReferenceImageSchema.extend({
  imageId: z.string().min(1, "Image is required"),
});
