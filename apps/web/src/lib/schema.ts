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

export const AddReferenceSchema = ReferenceImageSchema.extend({
  imageId: z.string().min(1, "Image is required"),
});
