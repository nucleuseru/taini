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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateElementFormSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useMutation } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const LABEL_CLASS =
  "mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase";
const INPUT_CLASS =
  "h-11 border-none bg-white/3 text-sm font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6";
const TEXTAREA_CLASS =
  "min-h-[80px] border-none bg-white/3 text-sm leading-relaxed font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6";

export function ElementActions() {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const [open, setOpen] = useState(false);

  const createCharacter = useMutation(api.character.create);
  const createEnvironment = useMutation(api.environment.create);
  const createItem = useMutation(api.item.create);

  const form = useForm<z.infer<typeof CreateElementFormSchema>>({
    resolver: zodResolver(CreateElementFormSchema),
    defaultValues: {
      type: "character",
      name: "",
      age: "",
      appearance: "",
      description: "",
      personality: "",
    },
  });

  const type = useWatch({ control: form.control, name: "type" });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      if (data.type === "character") {
        await createCharacter({
          projectId,
          name: data.name,
          age: data.age || undefined,
          appearance: data.appearance || undefined,
          description: data.description || undefined,
          personality: data.personality || undefined,
        });
      } else if (data.type === "environment") {
        await createEnvironment({
          projectId,
          name: data.name,
          description: data.description || undefined,
        });
      } else {
        await createItem({
          projectId,
          name: data.name,
          description: data.description || undefined,
        });
      }
      toast.success(`${data.type} created`);
      setOpen(false);
      form.reset();
    } catch {
      toast.error("Failed to create element");
    }
  });

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

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) form.reset();
        }}
      >
        <DialogContent className="p-0">
          <ScrollArea
            className={cn(
              "w-full",
              type === "character" ? "h-[80vh]" : "h-max",
            )}
          >
            <form onSubmit={(e) => void onSubmit(e)} className="p-6">
              <DialogHeader className="pb-6">
                <DialogTitle>Initialize Element</DialogTitle>
                <DialogDescription>
                  Define the core identity of your character, environment, or
                  item.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pb-8">
                <Controller
                  name="type"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                        Element Archetype
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className={INPUT_CLASS}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="border-none bg-[#1a1a1a] text-[#e5e2e1] shadow-2xl">
                          <SelectItem value="character">Character</SelectItem>
                          <SelectItem value="environment">
                            Environment
                          </SelectItem>
                          <SelectItem value="item">Item / Prop</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
                  <div className="sm:col-span-8">
                    <Controller
                      name="name"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className={LABEL_CLASS}
                          >
                            Identity Name
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            autoFocus
                            className={INPUT_CLASS}
                            placeholder="e.g. Elara Vance"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  {type === "character" && (
                    <div className="sm:col-span-4">
                      <Controller
                        name="age"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel
                              htmlFor={field.name}
                              className={LABEL_CLASS}
                            >
                              Age / Era
                            </FieldLabel>
                            <Input
                              {...field}
                              id={field.name}
                              className={INPUT_CLASS}
                              placeholder="e.g. 28"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                  )}
                </div>

                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className={LABEL_CLASS}>
                        Core Description
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        className={TEXTAREA_CLASS}
                        placeholder="Describe their role in the story..."
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {type === "character" && (
                  <div className="space-y-6">
                    <Controller
                      name="appearance"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className={LABEL_CLASS}
                          >
                            Visual Appearance
                          </FieldLabel>
                          <Textarea
                            {...field}
                            id={field.name}
                            className={TEXTAREA_CLASS}
                            placeholder="Height, clothing, unique features..."
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name="personality"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className={LABEL_CLASS}
                          >
                            Behavioral Traits
                          </FieldLabel>
                          <Textarea
                            {...field}
                            id={field.name}
                            className={TEXTAREA_CLASS}
                            placeholder="Motivation, speech patterns, temper..."
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>
                )}
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
                    <span>Create {type}</span>
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

export function ElementActionsSkeleton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="size-8 rounded-full"
      disabled
    >
      <Plus size={16} />
    </Button>
  );
}
