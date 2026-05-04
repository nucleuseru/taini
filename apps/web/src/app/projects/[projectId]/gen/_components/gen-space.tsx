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
import {
  UploadedImage,
  UploadedImageSelector,
} from "@/components/uploaded-image-selector";
import { cn } from "@/lib/utils";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useMutation } from "convex/react";
import { Loader2Icon, PlusIcon, SparklesIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useActionState, useState } from "react";
import { toast } from "sonner";

export function GenSpace() {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;

  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("2");
  const [activeTab, setActiveTab] = useState("image");
  const [endFrame, setEndFrame] = useState<UploadedImage | null>(null);
  const [startFrame, setStartFrame] = useState<UploadedImage | null>(null);
  const [referenceImages, setReferenceImages] = useState<UploadedImage[]>([]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "landscape",
  );

  const generateImage = useMutation(api.image.generate);
  const generateVideo = useMutation(api.video.generate);

  const [, generateAction, isPending] = useActionState(async () => {
    if (!prompt.trim()) return;

    const { width, height } = getDimensions(orientation);

    if (activeTab === "image") {
      try {
        await generateImage({
          projectId,
          prompt,
          width,
          height,
          status: "queued",
          referenceImages:
            referenceImages.length > 0
              ? referenceImages.map((img) => img._id)
              : undefined,
        });
      } catch {
        toast.error("Failed to generate image");
      }
    } else {
      try {
        await generateVideo({
          projectId,
          prompt,
          width,
          height,
          frameRate: "24",
          status: "queued",
          duration: parseInt(duration),
          startFrame: startFrame?._id ?? undefined,
          endFrame: endFrame?._id ?? undefined,
        });
      } catch {
        toast.error("Failed to generate video");
      }
    }

    setPrompt("");
    setReferenceImages([]);
    setStartFrame(null);
    setEndFrame(null);
  }, null);

  return (
    <div className="bg-card/80 flex flex-col gap-4 rounded-2xl border border-white/5 p-4 shadow-2xl backdrop-blur-2xl">
      <form action={generateAction} className="flex flex-col gap-4">
        {((activeTab === "image" && referenceImages.length > 0) ||
          (activeTab === "video" && (startFrame ?? endFrame))) && (
          <div className="animate-in fade-in slide-in-from-top-2 flex flex-wrap items-center gap-3 duration-300">
            {activeTab === "image" ? (
              referenceImages.map((img) => (
                <div
                  key={img._id}
                  className="group relative size-[60px] overflow-hidden rounded-xl border border-white/10 shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  {img.url && (
                    <Image
                      src={img.url}
                      alt="Ref"
                      width={60}
                      height={60}
                      className="object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setReferenceImages((currentImages) =>
                        currentImages.filter((i) => i._id !== img._id),
                      );
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <XIcon size={14} className="text-white" />
                  </button>
                </div>
              ))
            ) : (
              <>
                {startFrame && (
                  <div className="group relative size-[60px] overflow-hidden rounded-xl border border-white/10 shadow-xl transition-all hover:scale-105">
                    <div className="absolute top-0 left-0 z-10 rounded-br-md bg-black/60 px-1 py-0.5 text-[8px] font-bold tracking-tighter text-white/80 uppercase">
                      Start
                    </div>
                    {startFrame.url && (
                      <Image
                        src={startFrame.url}
                        alt="Start"
                        width={60}
                        height={60}
                        className="object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setStartFrame(null);
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <XIcon size={14} className="text-white" />
                    </button>
                  </div>
                )}
                {endFrame && (
                  <div className="group relative size-[60px] overflow-hidden rounded-xl border border-white/10 shadow-xl transition-all hover:scale-105">
                    <div className="absolute top-0 left-0 z-10 rounded-br-md bg-black/60 px-1 py-0.5 text-[8px] font-bold tracking-tighter text-white/80 uppercase">
                      End
                    </div>
                    {endFrame.url && (
                      <Image
                        src={endFrame.url}
                        alt="End"
                        width={60}
                        height={60}
                        className="object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEndFrame(null);
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <XIcon size={14} className="text-white" />
                    </button>
                  </div>
                )}
              </>
            )}
            <div className="mx-1 h-10 w-px bg-white/5" />
          </div>
        )}

        <div className="group relative">
          <Textarea
            value={prompt}
            disabled={isPending}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
            placeholder={
              activeTab === "image"
                ? "Describe the image you want to create..."
                : "Describe the motion and scene..."
            }
            className="bg-muted max-h-[300px] min-h-[120px] w-full resize-none rounded-xl border-none p-4 pb-10 text-sm leading-relaxed transition-all focus-visible:ring-1 focus-visible:ring-white/10"
          />
          <div className="absolute right-2 bottom-2">
            <Button
              size="icon"
              disabled={isPending || !prompt.trim()}
              className="h-8 w-8 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              {isPending ? (
                <Loader2Icon size={14} className="animate-spin" />
              ) : (
                <SparklesIcon size={14} />
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-white/5 sm:gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex rounded-lg p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-4 text-[10px] font-bold tracking-widest uppercase transition-all",
                  activeTab === "image"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white",
                )}
                onClick={() => {
                  setActiveTab("image");
                }}
              >
                Image
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-4 text-[10px] font-bold tracking-widest uppercase transition-all",
                  activeTab === "video"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white",
                )}
                onClick={() => {
                  setActiveTab("video");
                }}
              >
                Video
              </Button>
            </div>

            <div className="hidden h-6 w-px bg-white/10 sm:block" />

            <div className="flex items-center gap-2">
              {activeTab === "image" ? (
                <UploadedImageSelector
                  projectId={projectId}
                  selectedImages={referenceImages}
                  onSelect={setReferenceImages}
                  maxSelection={10}
                  label="Add References"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-8 w-8 rounded-lg border border-dashed border-white/10 bg-white/5 p-0 hover:bg-white/10 hover:text-white"
                  >
                    <PlusIcon size={14} />
                  </Button>
                </UploadedImageSelector>
              ) : (
                <div className="flex items-center gap-2">
                  <UploadedImageSelector
                    projectId={projectId}
                    selectedImages={startFrame ? [startFrame] : []}
                    onSelect={(imgs) => {
                      setStartFrame(imgs[0] ?? null);
                    }}
                    maxSelection={1}
                    label="Start Frame"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 rounded-lg border border-dashed px-3 text-[8px] font-bold tracking-tighter uppercase transition-all",
                        startFrame
                          ? "border-white/20 bg-white/10 text-white"
                          : "text-muted-foreground border-white/10 bg-white/5 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <PlusIcon size={12} className="mr-1" />
                      Start
                    </Button>
                  </UploadedImageSelector>

                  <UploadedImageSelector
                    projectId={projectId}
                    selectedImages={endFrame ? [endFrame] : []}
                    onSelect={(imgs) => {
                      setEndFrame(imgs[0] ?? null);
                    }}
                    maxSelection={1}
                    label="End Frame"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 rounded-lg border border-dashed px-3 text-[8px] font-bold tracking-tighter uppercase transition-all",
                        endFrame
                          ? "border-white/20 bg-white/10 text-white"
                          : "text-muted-foreground border-white/10 bg-white/5 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <PlusIcon size={12} className="mr-1" />
                      End
                    </Button>
                  </UploadedImageSelector>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-muted flex items-center gap-1 rounded-lg p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-3 text-[9px] font-bold tracking-widest uppercase transition-all",
                  orientation === "landscape"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white",
                )}
                onClick={() => {
                  setOrientation("landscape");
                }}
              >
                Landscape
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-3 text-[9px] font-bold tracking-widest uppercase transition-all",
                  orientation === "portrait"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white",
                )}
                onClick={() => {
                  setOrientation("portrait");
                }}
              >
                Portrait
              </Button>
            </div>

            {activeTab === "video" && (
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-muted h-9 w-24 rounded-lg border-none px-3 text-[9px] font-bold tracking-widest uppercase">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-black/90 backdrop-blur-xl">
                  <SelectItem value="2">2 Sec</SelectItem>
                  <SelectItem value="4">4 Sec</SelectItem>
                  <SelectItem value="6">6 Sec</SelectItem>
                  <SelectItem value="8">8 Sec</SelectItem>
                  <SelectItem value="10">10 Sec</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function getDimensions(orientation: "portrait" | "landscape") {
  let w = orientation === "landscape" ? 1280 : 720;
  let h = orientation === "landscape" ? 720 : 1280;

  // Ensure dimensions are multiples of 64 for AI models
  w = Math.round(w / 64) * 64;
  h = Math.round(h / 64) * 64;

  return { width: w, height: h };
}
