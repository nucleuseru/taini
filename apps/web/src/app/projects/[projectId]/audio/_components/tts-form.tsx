"use client";

import { Button } from "@/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogHeader,
  DrawerDialogTitle,
} from "@/components/ui/drawer-dialog";
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
import { Controller, useForm } from "react-hook-form";
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

  const selectedVoiceId = form.watch("referenceVoice") as Id<"voice">;
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
    } catch (error) {
      toast.error("Failed to generate audio");
    }
  });

  return (
    <>
      <DrawerDialog open={open} onOpenChange={onOpenChange}>
        <DrawerDialogContent className="max-w-xl border-none bg-[#1a1a1a] p-6 text-[#e5e2e1]">
          <DrawerDialogHeader className="px-0">
            <DrawerDialogTitle className="font-headline text-2xl font-bold tracking-tight">
              Generate Speech
            </DrawerDialogTitle>
            <DrawerDialogDescription className="text-muted-foreground mt-1 text-sm opacity-50">
              Convert your script into high-quality audio using AI voices.
            </DrawerDialogDescription>
          </DrawerDialogHeader>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Input
                      {...field}
                      placeholder="Audio Title (e.g. Intro Scene)"
                      className="h-12 border-none bg-white/5 ring-offset-0 focus-visible:ring-1 focus-visible:ring-white/10"
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
                  "h-12 justify-start border-none bg-white/5 px-4 text-sm font-medium transition-all hover:bg-white/10",
                  !selectedVoiceId && "text-muted-foreground",
                )}
                onClick={() => {
                  setIsSheetOpen(true);
                }}
              >
                <UserIcon size={16} className="mr-3 opacity-50" />
                {selectedVoice ? selectedVoice.name : "Select Voice"}
              </Button>
            </div>

            <div className="group relative">
              <Controller
                name="text"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Textarea
                      {...field}
                      placeholder="Type or paste your script here..."
                      className="min-h-[200px] w-full resize-none rounded-xl border-none bg-white/5 p-4 text-sm leading-relaxed transition-all focus-visible:ring-1 focus-visible:ring-white/10"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-white/5 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onOpenChange(false);
                }}
                className="h-11 rounded-xl px-6"
              >
                Cancel
              </Button>
              <Button
                disabled={form.formState.isSubmitting}
                className="h-11 rounded-xl bg-white px-8 font-semibold text-black hover:bg-white/90"
              >
                {form.formState.isSubmitting ? (
                  <Loader2Icon size={18} className="mr-2 animate-spin" />
                ) : (
                  <SparklesIcon size={18} className="mr-2" />
                )}
                Generate Audio
              </Button>
            </div>
          </form>
        </DrawerDialogContent>
      </DrawerDialog>

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
