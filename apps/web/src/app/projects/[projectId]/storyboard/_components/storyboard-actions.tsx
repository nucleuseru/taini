"use client";

import { Button } from "@/components/ui/button";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useAction, useConvex } from "convex/react";
import { Clapperboard, Download, Loader2, Mic, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function StoryboardActions({ projectId }: { projectId: Id<"project"> }) {
  const convex = useConvex();
  const createVoiceOverDialogue = useAction(api.agent.createVoiceOverDialogue);
  const createCharactersEnvironmentsItems = useAction(
    api.agent.createCharactersEnvironmentsItems,
  );
  const createShotsScenes = useAction(api.agent.createShotsScenes);

  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (
    action: () => Promise<unknown>,
    name: string,
    successMessage: string,
  ) => {
    setLoading(name);
    try {
      await action();
      toast.success(successMessage);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to execute ${name}`);
    } finally {
      setLoading(null);
    }
  };

  const handleExport = async () => {
    setLoading("export");
    try {
      const data = await convex.query(api.storyboard.exportData, { projectId });
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `storyboard-${projectId as string}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Export successful.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export storyboard.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={loading !== null}
        onClick={() => {
          void handleAction(
            () => createVoiceOverDialogue({ projectId }),
            "voiceover",
            "Started generating voiceovers from script.",
          );
        }}
      >
        {loading === "voiceover" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mic className="mr-2 h-4 w-4" />
        )}
        Generate Voiceover
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={loading !== null}
        onClick={() => {
          void handleAction(
            () => createCharactersEnvironmentsItems({ projectId }),
            "elements",
            "Started extracting characters, items, and environments.",
          );
        }}
      >
        {loading === "elements" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Users className="mr-2 h-4 w-4" />
        )}
        Extract Elements
      </Button>

      <Button
        variant="default"
        size="sm"
        disabled={loading !== null}
        onClick={() => {
          void handleAction(
            () => createShotsScenes({ projectId }),
            "shots",
            "Started generating scenes and shots.",
          );
        }}
      >
        {loading === "shots" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Clapperboard className="mr-2 h-4 w-4" />
        )}
        Generate Storyboard
      </Button>

      <Button
        variant="secondary"
        size="sm"
        disabled={loading !== null}
        onClick={() => {
          void handleExport();
        }}
      >
        {loading === "export" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Export
      </Button>
    </div>
  );
}
