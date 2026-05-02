"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Id } from "@repo/convex/dataModel";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { generateImage, generateVideo } from "../actions";

export function GenSpace() {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;

  const [activeTab, setActiveTab] = useState("image");
  const [prompt, setPrompt] = useState("");

  const [resolution, setResolution] = useState("1K");
  const [aspectRatio, setAspectRatio] = useState("16:9");

  const [duration, setDuration] = useState("2");
  const [frameRate, setFrameRate] = useState("24");

  const [, generateAction, isPending] = useActionState(async () => {
    if (!prompt.trim()) return;

    const { width, height } = getDimensions(resolution, aspectRatio);

    if (activeTab === "image") {
      const res = await generateImage({
        projectId,
        prompt,
        width,
        height,
      });

      if (res.error) {
        return toast.error(res.error);
      }
    } else {
      const res = await generateVideo({
        projectId,
        prompt,
        width,
        height,
        frameRate: frameRate as "24",
        duration: parseInt(duration),
      });

      if (res.error) {
        return toast.error(res.error);
      }
    }

    setPrompt("");
  }, null);

  return (
    <div className="bg-card flex flex-col rounded-xl p-4 sm:flex-row">
      <div className="flex min-w-[100px] flex-row sm:flex-col">
        <Button
          variant="ghost"
          className={cn(
            "text-muted-foreground flex-1 rounded border-none",
            activeTab === "image" && "bg-muted",
          )}
          onClick={() => {
            setActiveTab("image");
          }}
        >
          Image
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "text-muted-foreground flex-1 rounded border-none",
            activeTab === "video" && "bg-muted",
          )}
          onClick={() => {
            setActiveTab("video");
          }}
        >
          Video
        </Button>
      </div>

      <form action={generateAction} className="flex w-full flex-col gap-4">
        <Textarea
          value={prompt}
          disabled={isPending}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
          placeholder="A close-up of a woman talking on the phone..."
          className="bg-muted h-[100px] resize-none rounded border-none text-sm"
        />

        <div className="flex items-center justify-end gap-2 text-zinc-400 **:text-xs sm:gap-3">
          <Select value={resolution} onValueChange={setResolution}>
            <SelectTrigger className="bg-muted text-muted-foreground border-none px-2">
              <SelectValue placeholder="Resolution" />
            </SelectTrigger>
            <SelectContent className="border-[#353534] bg-[#1a1a1a] text-[#e5e2e1]">
              <SelectItem value="1K" className="hover:bg-[#2a2a2a]">
                1K
              </SelectItem>
              <SelectItem value="2K" className="hover:bg-[#2a2a2a]">
                2K
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger className="bg-muted text-muted-foreground border-none px-2">
              <SelectValue placeholder="Ratio" />
            </SelectTrigger>
            <SelectContent className="border-[#353534] bg-[#1a1a1a] text-[#e5e2e1]">
              <SelectItem value="1:1" className="hover:bg-[#2a2a2a]">
                1:1
              </SelectItem>
              <SelectItem value="9:16" className="hover:bg-[#2a2a2a]">
                9:16
              </SelectItem>
              <SelectItem value="16:9" className="hover:bg-[#2a2a2a]">
                16:9
              </SelectItem>
            </SelectContent>
          </Select>

          {activeTab === "video" && (
            <>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-muted text-muted-foreground border-none px-2">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent className="border-[#353534] bg-[#1a1a1a] text-[#e5e2e1]">
                  <SelectItem value="2" className="hover:bg-[#2a2a2a]">
                    2s
                  </SelectItem>
                  <SelectItem value="4" className="hover:bg-[#2a2a2a]">
                    4s
                  </SelectItem>
                  <SelectItem value="6" className="hover:bg-[#2a2a2a]">
                    6s
                  </SelectItem>
                  <SelectItem value="8" className="hover:bg-[#2a2a2a]">
                    8s
                  </SelectItem>
                  <SelectItem value="10" className="hover:bg-[#2a2a2a]">
                    10s
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={frameRate} onValueChange={setFrameRate}>
                <SelectTrigger className="bg-muted text-muted-foreground border-none px-2">
                  <SelectValue placeholder="FPS" />
                </SelectTrigger>
                <SelectContent className="border-[#353534] bg-[#1a1a1a] text-[#e5e2e1]">
                  <SelectItem value="24" className="hover:bg-[#2a2a2a]">
                    24 FPS
                  </SelectItem>
                  <SelectItem value="30" className="hover:bg-[#2a2a2a]">
                    30 FPS
                  </SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          <Button size="icon" disabled={isPending}>
            {isPending ? (
              <Loader2Icon size={16} className="animate-spin" />
            ) : (
              <ArrowUpIcon size={16} />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function getDimensions(resolution: string, aspectRatio: string) {
  let w = 1024;
  let h = 1024;

  if (resolution === "1K") {
    if (aspectRatio === "1:1") {
      w = 1024;
      h = 1024;
    } else if (aspectRatio === "16:9") {
      w = 1280;
      h = 720;
    } else if (aspectRatio === "9:16") {
      w = 720;
      h = 1280;
    }
  } else if (resolution === "2K") {
    if (aspectRatio === "1:1") {
      w = 1440;
      h = 1440;
    } else if (aspectRatio === "16:9") {
      w = 1920;
      h = 1080;
    } else if (aspectRatio === "9:16") {
      w = 1080;
      h = 1920;
    }
  }

  w = Math.round(w / 64) * 64;
  h = Math.round(h / 64) * 64;

  return { width: w, height: h };
}
