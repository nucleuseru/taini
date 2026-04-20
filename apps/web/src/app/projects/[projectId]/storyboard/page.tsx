import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { Loader2, Sparkles } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { Suspense } from "react";
import { ExistingStoryboardView } from "./ExistingStoryboardView";
import { StoryboardForm } from "./StoryboardForm";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * Cached data fetching for project details.
 * Uses 'use cache' to optimize performance while maintaining security via arguments.
 */
async function getProjectData(projectId: Id<"project">) {
  "use cache: private";
  cacheTag(`project-${projectId}`);
  cacheLife("minutes");

  return await fetchAuthQuery(api.project.get, { id: projectId });
}

/**
 * Cached data fetching for storyboard.
 */
async function getStoryboardData(projectId: Id<"project">) {
  "use cache: private";
  cacheTag(`storyboard-${projectId}`);
  cacheLife("minutes");

  return await fetchAuthQuery(api.storyboard.getByProject, { projectId });
}

export default async function StoryboardPage({ params }: PageProps) {
  const { projectId: projectIdStr } = await params;
  const projectId = projectIdStr as Id<"project">;

  // Ensure request-time connection for dynamic parts if needed
  await connection();

  return (
    <main className="bg-background relative min-h-screen overflow-hidden">
      {/* Background Cinematic Effects */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
        <div className="bg-primary/10 absolute -top-[10%] -left-[10%] h-[40%] w-[40%] animate-pulse rounded-full blur-[120px]" />
        <div
          className="bg-primary/5 absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] animate-pulse rounded-full blur-[120px]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-5xl px-6 py-12">
        <Suspense fallback={<StoryboardSkeleton />}>
          <StoryboardContent projectId={projectId} />
        </Suspense>
      </div>
    </main>
  );
}

async function StoryboardContent({ projectId }: { projectId: Id<"project"> }) {
  const [project, existingStoryboard] = await Promise.all([
    getProjectData(projectId),
    getStoryboardData(projectId),
  ]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-muted mb-4 rounded-full p-4">
          <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold">Project not found</h2>
        <p className="text-muted-foreground">
          The project you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access.
        </p>
      </div>
    );
  }

  if (existingStoryboard) {
    return (
      <ExistingStoryboardView
        projectId={projectId}
        projectName={project.name}
        script={existingStoryboard.script}
      />
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-4 space-y-12 duration-1000">
      <div className="max-w-2xl">
        <div className="text-primary mb-4 flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
          <Sparkles className="h-4 w-4" />
          New Storyboard
        </div>
        <h1 className="mb-6 text-6xl leading-none font-black tracking-tighter">
          Bring your <span className="text-primary">script</span> to life.
        </h1>
        <p className="text-muted-foreground text-xl leading-relaxed">
          Start your production for{" "}
          <span className="text-foreground font-semibold">{project.name}</span>{" "}
          by providing a script. Our AI will analyze the narrative, extract key
          elements, and prepare your cinematic pipeline.
        </p>
      </div>

      <StoryboardForm projectId={projectId} />
    </div>
  );
}

function StoryboardSkeleton() {
  return (
    <div className="animate-pulse space-y-12">
      <div className="space-y-4">
        <div className="bg-muted h-4 w-32 rounded" />
        <div className="bg-muted h-16 w-3/4 rounded-xl" />
        <div className="bg-muted h-6 w-1/2 rounded" />
      </div>
      <div className="bg-muted/50 border-muted h-[500px] w-full rounded-3xl border-2 border-dashed" />
    </div>
  );
}
