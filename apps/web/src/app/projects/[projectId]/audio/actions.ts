"use server";

import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";

export async function generateAudio(options: {
  title: string;
  text: string;
  referenceVoice: Id<"voice">;
  projectId: Id<"project">;
}) {
  try {
    const { audioId } = await fetchAuthMutation(api.audio.generate, options);
    await fetchAuthMutation(api.audio.triggerInference, { id: audioId });
    return { success: true, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate audio" };
  }
}

export async function cloneVoice(options: {
  name: string;
  referenceAudio: Id<"audio">;
  projectId: Id<"project">;
}) {
  try {
    const { voiceId } = await fetchAuthMutation(api.voice.clone, options);
    await fetchAuthMutation(api.voice.triggerInference, { id: voiceId });
    return { success: true, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to clone voice" };
  }
}

export async function uploadAudio(options: {
  title: string;
  storageId: Id<"_storage">;
  projectId: Id<"project">;
}) {
  try {
    await fetchAuthMutation(api.audio.upload, options);
    return { success: true, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to upload audio" };
  }
}

export async function uploadVoice(options: {
  name: string;
  storageId: Id<"_storage">;
  projectId: Id<"project">;
}) {
  try {
    await fetchAuthMutation(api.voice.upload, options);
    return { success: true, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to upload voice" };
  }
}
