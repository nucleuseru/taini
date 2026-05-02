"use server";

import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "@repo/convex/api";
import { redirect, unstable_rethrow } from "next/navigation";

export async function createProject(name: string) {
  try {
    const project = await fetchAuthMutation(api.project.create, { name });
    return redirect(`/projects/${project.projectId}/gen`);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to create storyboard:", error);
    return "Failed to create storyboard";
  }
}
