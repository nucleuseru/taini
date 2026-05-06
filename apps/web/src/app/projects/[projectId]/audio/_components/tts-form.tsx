"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TTSFormSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Loader2Icon, SparklesIcon, UserIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { VoiceSheet } from "./voice-sheet";

interface TTSFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TTSForm({ open, onOpenChange }: TTSFormProps) {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const generateAudio = useMutation(api.audio.generate);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(TTSFormSchema),
    defaultValues: {
      title: "",
      text: "",
      referenceVoice: "" as Id<"voice">,
    },
  });

  const selectedVoiceId = useWatch({
    control: form.control,
    name: "referenceVoice",
  }) as Id<"voice">;

  const selectedVoice = useQuery(
    api.voice.get,
    selectedVoiceId ? { id: selectedVoiceId } : "skip",
  );

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await generateAudio({
        projectId,
        text: data.text,
        title: data.title,
        referenceVoice: data.referenceVoice as Id<"voice">,
        ttsStatus: "queued",
      });
      toast.success("Audio generation queued");
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to generate audio");
    }
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Speech</DialogTitle>
            <DialogDescription>
              Convert your script into high-quality audio using AI voices.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => void onSubmit(e)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Audio Title (e.g. Intro Scene)"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button
                type="button"
                variant="outline"
                className={cn(
                  "justify-start border-none bg-white/5 px-4 text-sm font-medium transition-all hover:bg-white/10",
                  !selectedVoiceId && "text-muted-foreground",
                )}
                onClick={() => {
                  setIsSheetOpen(true);
                }}
              >
                <UserIcon size={16} className="opacity-50" />
                {selectedVoice ? selectedVoice.name : "Select Voice"}
              </Button>
            </div>

            <Controller
              name="text"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Textarea
                    {...field}
                    placeholder="Type or paste your script here..."
                    className="h-[100px] w-full resize-none rounded-xl border-none bg-white/5 p-4 text-sm leading-relaxed transition-all focus-visible:ring-1 focus-visible:ring-white/10"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2Icon size={16} className="animate-spin" />
                ) : (
                  <SparklesIcon size={16} />
                )}
                Generate Audio
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <VoiceSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedVoiceId={selectedVoiceId}
        onSelect={(voice) => {
          form.setValue("referenceVoice", voice._id, { shouldValidate: true });
        }}
      />
    </>
  );
}
