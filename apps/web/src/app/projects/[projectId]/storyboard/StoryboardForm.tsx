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
import { Loader2, Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createStoryboardAction, startGenerationAction } from "./actions";

interface StoryboardFormProps {
  projectId: Id<"project">;
}

export function StoryboardForm({ projectId }: StoryboardFormProps) {
  const [script, setScript] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!script.trim()) return;

    startTransition(async () => {
      const createRes = await createStoryboardAction(projectId, script);
      if (!createRes.success) {
        toast.error(createRes.error);
        return;
      }

      toast.info("Storyboard created. Starting AI generation...");

      const genRes = await startGenerationAction(projectId);
      if (!genRes.success) {
        toast.error(genRes.error);
        return;
      }

      toast.success(
        "Generation started! Characters and environments are being created.",
      );
      router.push(`/projects/${projectId}/elements`);
    });
  };

  return (
    <Card className="group border-primary/20 bg-background/50 overflow-hidden shadow-2xl backdrop-blur-xl">
      <div className="from-primary/5 to-primary/5 pointer-events-none absolute inset-0 bg-linear-to-br via-transparent" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <div className="bg-primary/10 rounded-lg p-2">
            <Sparkles className="text-primary h-6 w-6 animate-pulse" />
          </div>
          Initialize Storyboard
        </CardTitle>
        <CardDescription className="text-base">
          Our AI will analyze your script to extract characters, environments,
          and plan out your scenes.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <div className="group/textarea relative">
            <textarea
              id="script"
              className="border-primary/10 bg-background/80 focus:border-primary/50 focus:ring-primary/10 min-h-[400px] w-full resize-none rounded-2xl border-2 p-6 text-base leading-relaxed shadow-inner transition-all duration-300 focus:ring-4 focus:outline-none"
              placeholder="Paste your film script here... e.g. INT. COFFEE SHOP - DAY. A young woman sits at a corner table, staring at a blank screen..."
              value={script}
              onChange={(e) => {
                setScript(e.target.value);
              }}
              disabled={isPending}
            />
            <div className="bg-background/80 text-muted-foreground absolute right-4 bottom-4 rounded border px-2 py-1 font-mono text-xs">
              {script.length} chars
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              size="xl"
              disabled={isPending || !script.trim()}
              className="bg-primary shadow-primary/20 h-14 rounded-full px-10 text-lg font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-3 h-5 w-5" />
                  Start Production
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
