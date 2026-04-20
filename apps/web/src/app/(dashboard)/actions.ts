"use server";

import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "@repo/convex/api";

export async function createProject(name: string) {
  try {
    const project = await fetchAuthMutation(api.project.create, { name });

    return { success: true, data: project } as const;
  } catch (error) {
    console.error("Failed to create storyboard:", error);
    return { success: false, error: "Failed to create storyboard" } as const;
  }
}
