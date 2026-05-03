"use server";

import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";

export interface GenerateAudioOptions {
  title: string;
  text: string;
  referenceVoice: Id<"voice">;
  projectId: Id<"project">;
}

export interface CloneVoiceOptions {
  name: string;
  referenceAudio: Id<"audio">;
  projectId: Id<"project">;
}

export interface UploadAudioOptions {
  title: string;
  storageId: Id<"_storage">;
  projectId: Id<"project">;
}

export interface UploadVoiceOptions {
  name: string;
  storageId: Id<"_storage">;
  projectId: Id<"project">;
}

export async function generateAudio(options: GenerateAudioOptions) {
  try {
    const { audioId } = await fetchAuthMutation(api.audio.generate, options);
    await fetchAuthMutation(api.audio.triggerInference, { id: audioId });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate audio" };
  }
}

export async function cloneVoice(options: CloneVoiceOptions) {
  try {
    const { voiceId } = await fetchAuthMutation(api.voice.clone, options);
    await fetchAuthMutation(api.voice.triggerInference, { id: voiceId });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to clone voice" };
  }
}

export async function uploadAudio(options: UploadAudioOptions) {
  try {
    await fetchAuthMutation(api.audio.upload, options);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to upload audio" };
  }
}

export async function uploadVoice(options: UploadVoiceOptions) {
  try {
    await fetchAuthMutation(api.voice.upload, options);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to upload voice" };
  }
}

export async function getUploadUrl() {
  return await fetchAuthMutation(api.upload.generateUrl, {});
}

export async function removeAudio(id: Id<"audio">) {
  try {
    await fetchAuthMutation(api.audio.remove, { id });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to remove audio" };
  }
}

export async function removeVoice(id: Id<"voice">) {
  try {
    await fetchAuthMutation(api.voice.remove, { id });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to remove voice" };
  }
}
