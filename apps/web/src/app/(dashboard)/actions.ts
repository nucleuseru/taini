"use server";

import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "@repo/convex/api";
import { revalidateTag } from "next/cache";
import { redirect, unstable_rethrow as rethrow } from "next/navigation";

export async function createProject(name: string) {
  try {
    const project = await fetchAuthMutation(api.project.create, { name });
    revalidateTag("project:list", "max");
    return redirect(`/projects/${project.projectId}/gen`);
  } catch (error) {
    rethrow(error);
    console.error("Failed to create storyboard:", error);
    return "Failed to create storyboard";
  }
}
