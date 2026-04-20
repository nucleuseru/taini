"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Id } from "@repo/convex/dataModel";
import { ArrowRight, Film, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { startGenerationAction } from "./actions";

interface ExistingStoryboardViewProps {
  projectId: Id<"project">;
  projectName: string;
  script: string;
}

export function ExistingStoryboardView({
  projectId,
  projectName,
  script,
}: ExistingStoryboardViewProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRefine = () => {
    startTransition(async () => {
      toast.info("Re-starting generation with existing script...");
      const res = await startGenerationAction(projectId);
      if (res.success) {
        toast.success("AI generation refined! Redirecting...");
        router.push(`/projects/${projectId}/elements`);
      } else {
        toast.error("Failed to refine generation.");
      }
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-10 duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="text-primary flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
            <Film className="h-4 w-4" />
            Project Storyboard
          </div>
          <h1 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-5xl font-black tracking-tight text-transparent">
            {projectName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-full border-2"
            onClick={() => {
              router.push(`/projects/${projectId}/elements`);
            }}
          >
            View Elements
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="h-12 rounded-full font-semibold shadow-sm"
            onClick={handleRefine}
            disabled={isPending}
          >
            <Sparkles className="text-primary mr-2 h-4 w-4" />
            {isPending ? "Refining..." : "Refine with AI"}
          </Button>
        </div>
      </div>

      <Card className="bg-muted/20 relative overflow-hidden border-none shadow-inner backdrop-blur-sm">
        <div className="bg-primary/30 absolute top-0 left-0 h-full w-1" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            Production Script
          </CardTitle>
          <CardDescription>
            The foundation for your cinematic masterpiece.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-background/40 border-border/50 rounded-2xl border p-8 font-serif text-lg leading-loose whitespace-pre-wrap shadow-xl md:p-12">
            <div className="text-foreground/80 mx-auto max-w-2xl italic opacity-90">
              {script}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            title: "Characters",
            desc: "AI-generated personas based on your script.",
            link: "elements?tab=characters",
          },
          {
            title: "Environments",
            desc: "Detailed worlds extracted from descriptions.",
            link: "elements?tab=environments",
          },
          {
            title: "Scenes",
            desc: "Automated breakdown of your production timeline.",
            link: "scenes",
          },
        ].map((item, i) => (
          <Card
            key={i}
            className="bg-background/40 border-primary/5 hover:border-primary/20 group cursor-pointer transition-all"
            onClick={() => {
              router.push(`/projects/${projectId}/${item.link}`);
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                {item.title}
                <ArrowRight className="text-primary h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </CardTitle>
              <CardDescription>{item.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
