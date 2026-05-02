"use server";

import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";

export async function generateImage(options: {
  prompt: string;
  width: number;
  height: number;
  projectId: Id<"project">;
  referenceImages?: Id<"image">[];
}) {
  try {
    const { imageId } = await fetchAuthMutation(api.image.generate, options);
    await fetchAuthMutation(api.image.triggerInference, { id: imageId });
    return { success: true, error: null };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to generate image" };
  }
}

export async function generateVideo(options: {
  prompt: string;
  width: number;
  height: number;
  duration: number;
  frameRate: "24" | "30";
  projectId: Id<"project">;
  startFrame?: Id<"image">;
  endFrame?: Id<"image">;
}) {
  try {
    const { videoId } = await fetchAuthMutation(api.video.generate, options);
    await fetchAuthMutation(api.video.triggerInference, { id: videoId });
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to generate video" };
  }
}
