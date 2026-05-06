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
import { Controller, useForm, useWatch } from "react-hook-form";
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

  const selectedAudioId = useWatch({
    control: form.control,
    name: "referenceAudio",
  }) as Id<"audio">;

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
    } catch {
      toast.error("Failed to clone voice");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone a Voice</DialogTitle>
          <DialogDescription>
            Create a custom voice by providing a short reference audio sample.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="Voice Name (e.g. Scarlett)"
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
                  "w-full justify-start border-none bg-white/5 px-4 text-sm font-medium transition-all hover:bg-white/10",
                  !selectedAudioId && "text-muted-foreground",
                )}
              >
                <PlusIcon size={16} className="opacity-50" />
                {selectedAudio ? selectedAudio.title : "Reference Audio"}
              </Button>
            </UploadedAudioSelector>
          </div>

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
                <MicIcon size={16} />
              )}
              Start Cloning
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
