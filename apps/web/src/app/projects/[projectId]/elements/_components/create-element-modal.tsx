"use client";

import { Button } from "@/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/ui/drawer-dialog";
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

const FormSchema = z.object({
  type: z.enum(["character", "environment", "item"]),
  name: z.string().min(1, "Name is required"),
  age: z.string().optional(),
  appearance: z.string().optional(),
  description: z.string().optional(),
  personality: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export function CreateElementModal() {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const [open, setOpen] = useState(false);

  const createCharacter = useMutation(api.character.create);
  const createEnvironment = useMutation(api.environment.create);
  const createItem = useMutation(api.item.create);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
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

  const onSubmit = form.handleSubmit(async (formData) => {
    try {
      if (formData.type === "character") {
        await createCharacter({
          projectId,
          name: formData.name,
          age: formData.age ?? "",
          appearance: formData.appearance ?? "",
          description: formData.description ?? "",
          personality: formData.personality ?? "",
        });
      } else if (formData.type === "environment") {
        await createEnvironment({
          projectId,
          name: formData.name,
          description: formData.description ?? "",
        });
      } else {
        await createItem({
          projectId,
          name: formData.name,
          description: formData.description ?? "",
        });
      }

      toast.success(`${formData.type} created successfully`);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    }
  });

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      <DrawerDialogTrigger asChild>
        <Button className="fixed right-8 bottom-8 z-50 h-14 w-14 rounded-full bg-[#efcb61] p-0 text-[#3d2f00] shadow-2xl shadow-[#efcb61]/20 transition-all hover:scale-110 hover:bg-[#d2af48] active:scale-95">
          <Plus size={28} strokeWidth={2.5} />
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent className="w-full p-0 md:max-w-[640px] md:rounded-2xl">
        <ScrollArea
          className={cn("w-full", type === "character" ? "h-[80vh]" : "h-max")}
        >
          <form onSubmit={(e) => void onSubmit(e)} className="p-6">
            <DrawerDialogHeader className="pb-6">
              <DrawerDialogTitle className="font-headline text-2xl font-bold tracking-tight text-white">
                Initialize Element
              </DrawerDialogTitle>
              <DrawerDialogDescription className="text-sm leading-relaxed text-[#e5e2e1]/40">
                Begin by defining the core identity of your character,
                environment, or item.
              </DrawerDialogDescription>
            </DrawerDialogHeader>

            <div className="space-y-6 pb-8">
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                    >
                      Element Archetype
                    </FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="h-11 border-none bg-white/3 text-sm font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="border-none bg-[#1a1a1a] text-[#e5e2e1] shadow-2xl">
                        <SelectItem value="character">Character</SelectItem>
                        <SelectItem value="environment">Environment</SelectItem>
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
                          className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                        >
                          Identity Name
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          autoFocus
                          className="h-11 border-none bg-white/3 text-sm font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
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
                            className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                          >
                            Age / Era
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            className="h-11 border-none bg-white/3 text-sm font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
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
                    <FieldLabel
                      htmlFor={field.name}
                      className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                    >
                      Core Description
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={field.name}
                      className="min-h-[80px] border-none bg-white/3 text-sm leading-relaxed font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
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
                          className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                        >
                          Visual Appearance
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id={field.name}
                          className="min-h-[80px] border-none bg-white/3 text-sm leading-relaxed font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
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
                          className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                        >
                          Behavioral Traits
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id={field.name}
                          className="min-h-[80px] border-none bg-white/3 text-sm leading-relaxed font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
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

            <DrawerDialogFooter className="pt-6">
              <Button
                type="button"
                variant="ghost"
                className="h-11 text-[10px] font-bold tracking-widest text-white/30 uppercase hover:bg-white/5 hover:text-white"
                disabled={form.formState.isSubmitting}
                onClick={() => {
                  setOpen(false);
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
            </DrawerDialogFooter>
          </form>
        </ScrollArea>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
