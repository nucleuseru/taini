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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CreateStoryboardFormSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  Download,
  Flame,
  LayoutGrid,
  Loader2,
  Mic2,
  MoreVertical,
  Plus,
  Settings,
  UserPlus,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const LABEL_CLASS =
  "mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase";
const INPUT_CLASS =
  "h-11 border-none bg-white/3 text-sm font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6";
const TEXTAREA_CLASS =
  "min-h-[120px] border-none bg-white/3 text-sm leading-relaxed font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6";

export function StoryboardNavbarActions() {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const storyboard = useQuery(api.storyboard.getByProject, { projectId });
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const createStoryboard = useMutation(api.storyboard.create);
  const updateStoryboard = useMutation(api.storyboard.update);

  const form = useForm({
    resolver: zodResolver(CreateStoryboardFormSchema),
    defaultValues: {
      script: "",
      width: 1920,
      height: 1080,
      frameRate: "24",
      style: "",
      audio: true,
    },
  });

  useEffect(() => {
    if (storyboard) {
      form.reset({
        script: storyboard.script,
        width: storyboard.width ?? 1920,
        height: storyboard.height ?? 1080,
        frameRate: storyboard.frameRate ?? "24",
        style: storyboard.style ?? "",
        audio: storyboard.audio ?? true,
      });
    }
  }, [storyboard, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      if (!storyboard) {
        await createStoryboard({
          projectId,
          ...data,
        });
        toast.success("Storyboard created");
      } else {
        await updateStoryboard({
          id: storyboard._id,
          ...data,
        });
        toast.success("Storyboard updated");
      }
      setOpen(false);
    } catch {
      toast.error("Failed to save storyboard");
    }
  });

  if (storyboard === undefined)
    return <div className="size-8 animate-pulse rounded-full bg-white/5" />;

  if (!storyboard) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="size-8 rounded-full"
          onClick={() => {
            setOpen(true);
          }}
        >
          <Plus size={16} />
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="p-0 sm:max-w-2xl">
            <ScrollArea className="h-max max-h-[90vh]">
              <form onSubmit={(e) => void onSubmit(e)} className="p-6">
                <DialogHeader className="pb-6">
                  <DialogTitle>Forge Storyboard</DialogTitle>
                  <DialogDescription>
                    Map out your creative vision with a script and technical
                    specifications.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pb-8">
                  <Controller
                    name="script"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className={LABEL_CLASS}
                        >
                          The Script
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id={field.name}
                          className={TEXTAREA_CLASS}
                          placeholder="Scene 1: Interior. Neon-lit alleyway..."
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <Controller
                      name="width"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className={LABEL_CLASS}
                          >
                            Width (px)
                          </FieldLabel>
                          <Input
                            {...field}
                            type="number"
                            id={field.name}
                            className={INPUT_CLASS}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name="height"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className={LABEL_CLASS}
                          >
                            Height (px)
                          </FieldLabel>
                          <Input
                            {...field}
                            type="number"
                            id={field.name}
                            className={INPUT_CLASS}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name="frameRate"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className={LABEL_CLASS}
                          >
                            FPS
                          </FieldLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className={INPUT_CLASS}>
                              <SelectValue placeholder="FPS" />
                            </SelectTrigger>
                            <SelectContent className="border-none bg-[#1a1a1a] text-[#e5e2e1] shadow-2xl">
                              <SelectItem value="24">24 FPS</SelectItem>
                              <SelectItem value="30">30 FPS</SelectItem>
                              <SelectItem value="60">60 FPS</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <Controller
                    name="style"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className={LABEL_CLASS}
                        >
                          Visual Style
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          className={INPUT_CLASS}
                          placeholder="e.g. Noir, Cyberpunk, Cinematic..."
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="audio"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-lg bg-white/3 p-4 transition-colors hover:bg-white/5">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium tracking-wide text-[#e5e2e1]">
                            Audio & Voiceover
                          </label>
                          <p className="text-[10px] tracking-wider text-white/30 uppercase">
                            Automated dialogue extraction
                          </p>
                        </div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                </div>

                <DialogFooter className="pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 text-[10px] font-bold tracking-widest text-white/30 uppercase hover:bg-white/5 hover:text-white"
                    disabled={form.formState.isSubmitting}
                    onClick={() => {
                      setOpen(false);
                      form.reset();
                    }}
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="h-11 min-w-[140px] bg-[#efcb61] text-[10px] font-bold tracking-widest text-[#3d2f00] uppercase transition-all hover:scale-[1.02] hover:bg-[#d2af48]"
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Forge Storyboard</span>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="size-8 rounded-full">
            <MoreVertical size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 border-none bg-[#1a1a1a] p-1 text-[#e5e2e1] shadow-2xl"
          align="end"
        >
          <div className="grid gap-1">
            <button
              onClick={() => {
                setOpen(true);
                setPopoverOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5"
            >
              <Settings size={14} className="text-white/40" />
              Technical Specs
            </button>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5">
              <Download size={14} className="text-white/40" />
              Export Project
            </button>
            {storyboard.audio && (
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5">
                <Mic2 size={14} className="text-[#efcb61]" />
                Extract Voiceovers
              </button>
            )}
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5">
              <UserPlus size={14} className="text-white/40" />
              Extract Characters
            </button>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5">
              <LayoutGrid size={14} className="text-white/40" />
              Compose Scenes
            </button>
            <div className="my-1 h-px bg-white/5" />
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-bold text-[#efcb61] transition-colors hover:bg-white/5">
              <Flame size={14} />
              Generate All
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 sm:max-w-2xl">
          <ScrollArea className="h-max max-h-[90vh]">
            <form onSubmit={(e) => void onSubmit(e)} className="p-6">
              <DialogHeader className="pb-6">
                <DialogTitle>Update Specs</DialogTitle>
                <DialogDescription>
                  Refine the technical and creative foundation of your
                  storyboard.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pb-8">
                {/* Same form fields as creation for now, but labeled "Update" */}
                <Controller
                  name="script"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                        The Script
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        className={TEXTAREA_CLASS}
                        placeholder="Scene 1: Interior. Neon-lit alleyway..."
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <Controller
                    name="width"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className={LABEL_CLASS}
                        >
                          Width (px)
                        </FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          id={field.name}
                          className={INPUT_CLASS}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="height"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className={LABEL_CLASS}
                        >
                          Height (px)
                        </FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          id={field.name}
                          className={INPUT_CLASS}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="frameRate"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className={LABEL_CLASS}
                        >
                          FPS
                        </FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className={INPUT_CLASS}>
                            <SelectValue placeholder="FPS" />
                          </SelectTrigger>
                          <SelectContent className="border-none bg-[#1a1a1a] text-[#e5e2e1] shadow-2xl">
                            <SelectItem value="24">24 FPS</SelectItem>
                            <SelectItem value="30">30 FPS</SelectItem>
                            <SelectItem value="60">60 FPS</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name="style"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                        Visual Style
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        className={INPUT_CLASS}
                        placeholder="e.g. Noir, Cyberpunk, Cinematic..."
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="audio"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg bg-white/3 p-4 transition-colors hover:bg-white/5">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium tracking-wide text-[#e5e2e1]">
                          Audio & Voiceover
                        </label>
                        <p className="text-[10px] tracking-wider text-white/30 uppercase">
                          Automated dialogue extraction
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>

              <DialogFooter className="pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 text-[10px] font-bold tracking-widest text-white/30 uppercase hover:bg-white/5 hover:text-white"
                  disabled={form.formState.isSubmitting}
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="h-11 min-w-[140px] bg-[#efcb61] text-[10px] font-bold tracking-widest text-[#3d2f00] uppercase transition-all hover:scale-[1.02] hover:bg-[#d2af48]"
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Update Specs</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StoryboardNavbarActionsSkeleton() {
  return <div className="size-8 rounded-full bg-white/5" />;
}
