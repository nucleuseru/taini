"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function CreateStoryboardForm({
  projectId,
}: {
  projectId: Id<"project">;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [script, setScript] = useState("");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [style, setStyle] = useState("");
  const [frameRate, setFrameRate] = useState<"24" | "30" | "60">("24");
  const [audio, setAudio] = useState(true);

  const createStoryboard = useMutation(api.storyboard.create);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createStoryboard({
        projectId,
        script,
        width: parseInt(width),
        height: parseInt(height),
        style: style || undefined,
        frameRate,
        audio,
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to create storyboard", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Create Storyboard</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <DialogHeader>
            <DialogTitle>Create Storyboard</DialogTitle>
            <DialogDescription>
              Provide the script and global settings for your project&apos;s
              storyboard.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <Field>
              <FieldLabel htmlFor="script">Script / Screenplay</FieldLabel>
              <FieldContent>
                <Textarea
                  id="script"
                  placeholder="Enter the script text here..."
                  className="min-h-[150px]"
                  value={script}
                  onChange={(e) => {
                    setScript(e.target.value);
                  }}
                  required
                />
              </FieldContent>
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="width">Width (px)</FieldLabel>
                <FieldContent>
                  <Input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => {
                      setWidth(e.target.value);
                    }}
                    required
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="height">Height (px)</FieldLabel>
                <FieldContent>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => {
                      setHeight(e.target.value);
                    }}
                    required
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="frameRate">Frame Rate</FieldLabel>
                <FieldContent>
                  <Select
                    value={frameRate}
                    onValueChange={(val: "24" | "30" | "60") => {
                      setFrameRate(val);
                    }}
                  >
                    <SelectTrigger id="frameRate">
                      <SelectValue placeholder="Select FPS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 FPS</SelectItem>
                      <SelectItem value="30">30 FPS</SelectItem>
                      <SelectItem value="60">60 FPS</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="style">Art Style (Optional)</FieldLabel>
              <FieldContent>
                <Input
                  id="style"
                  placeholder="e.g. Cinematic, 35mm film, volumetric lighting..."
                  value={style}
                  onChange={(e) => {
                    setStyle(e.target.value);
                  }}
                />
              </FieldContent>
            </Field>

            <Field className="flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
              <div>
                <FieldLabel htmlFor="audio" className="text-base">
                  Audio & Voiceover
                </FieldLabel>
                <p className="text-muted-foreground mt-1 text-[13px]">
                  Enable dialog extraction.
                </p>
              </div>
              <FieldContent className="w-auto flex-none">
                <Switch id="audio" checked={audio} onCheckedChange={setAudio} />
              </FieldContent>
            </Field>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !script.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Storyboard
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
