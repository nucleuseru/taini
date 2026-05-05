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
import {
  UploadedAudio,
  UploadedAudioSelector,
} from "@/components/uploaded-audio-selector";
import { VoiceCloneFormSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Loader2Icon, MicIcon, PlusIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface VoiceCloneFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceCloneForm({ open, onOpenChange }: VoiceCloneFormProps) {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const cloneVoice = useMutation(api.voice.clone);

  const form = useForm({
    resolver: zodResolver(VoiceCloneFormSchema),
    defaultValues: {
      name: "",
      referenceAudio: "" as Id<"audio">,
    },
  });

  const selectedAudioId = form.watch("referenceAudio") as Id<"audio">;
  const selectedAudio = useQuery(
    api.audio.get,
    selectedAudioId ? { id: selectedAudioId } : "skip",
  );

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await cloneVoice({
        projectId,
        name: data.name,
        referenceAudio: data.referenceAudio as Id<"audio">,
      });
      toast.success("Voice cloning queued");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to clone voice");
    }
  });

  return (
    <DrawerDialog open={open} onOpenChange={onOpenChange}>
      <DrawerDialogContent className="max-w-xl border-none bg-[#1a1a1a] p-6 text-[#e5e2e1]">
        <DrawerDialogHeader className="px-0">
          <DrawerDialogTitle className="font-headline text-2xl font-bold tracking-tight">
            Clone a Voice
          </DrawerDialogTitle>
          <DrawerDialogDescription className="text-muted-foreground mt-1 text-sm opacity-50">
            Create a custom voice by providing a short reference audio sample.
          </DrawerDialogDescription>
        </DrawerDialogHeader>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    placeholder="Voice Name (e.g. Scarlett)"
                    className="h-12 border-none bg-white/5 ring-offset-0 focus-visible:ring-1 focus-visible:ring-white/10"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <UploadedAudioSelector
              projectId={projectId}
              selectedAudios={
                selectedAudio ? [selectedAudio as UploadedAudio] : []
              }
              onSelect={(audios: UploadedAudio[]) => {
                form.setValue("referenceAudio", audios[0]?._id ?? "", {
                  shouldValidate: true,
                });
              }}
              maxSelection={1}
              label="Select Reference"
            >
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-12 w-full justify-start border-none bg-white/5 px-4 text-sm font-medium transition-all hover:bg-white/10",
                  !selectedAudioId && "text-muted-foreground",
                )}
              >
                <PlusIcon size={16} className="mr-3 opacity-50" />
                {selectedAudio ? selectedAudio.title : "Reference Audio"}
              </Button>
            </UploadedAudioSelector>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/5 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <MicIcon size={24} className="text-muted-foreground opacity-50" />
            </div>
            <div className="max-w-[280px]">
              <p className="text-sm font-medium">Analyze Voice Profile</p>
              <p className="text-muted-foreground mt-1 text-xs opacity-50">
                The AI will extract vocal characteristics from the reference
                sample.
              </p>
            </div>
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
                <MicIcon size={18} className="mr-2" />
              )}
              Start Cloning
            </Button>
          </div>
        </form>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
