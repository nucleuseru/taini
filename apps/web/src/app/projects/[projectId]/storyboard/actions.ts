"use server";

import { fetchAuthAction, fetchAuthMutation } from "@/lib/auth-server";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { revalidateTag } from "next/cache";

export async function createStoryboardAction(
  projectId: Id<"project">,
  script: string,
) {
  try {
    await fetchAuthMutation(api.storyboard.create, {
      projectId,
      script,
    });

    // Invalidate the cache for this project's storyboard
    revalidateTag(`storyboard-${projectId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to create storyboard:", error);
    return { success: false, error: "Failed to create storyboard" };
  }
}

export async function startGenerationAction(projectId: Id<"project">) {
  try {
    await fetchAuthAction(api.agent.createCharactersAndEnvironments, {
      projectId,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to start generation:", error);
    return { success: false, error: "Failed to start generation" };
  }
}
