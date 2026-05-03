"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Id } from "@repo/convex/dataModel";
import { Loader2, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createElement } from "../actions";

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
      const res = await createElement({ ...formData, projectId });

      if (res.success) {
        toast.success(`${formData.type} created successfully`);
        setOpen(false);
        form.reset();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed right-8 bottom-8 z-50 h-12 w-12 rounded-full bg-[#efcb61] p-0 text-[#3d2f00] shadow-lg hover:bg-[#d2af48]">
          <Plus size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[#353534] bg-[#1a1a1a] text-[#e5e2e1] sm:max-w-[425px]">
        <form onSubmit={(e) => void onSubmit(e)}>
          <DialogHeader>
            <DialogTitle className="font-headline text-xl font-bold tracking-tight">
              Create New Element
            </DialogTitle>
            <DialogDescription className="text-[#e5e2e1]/50">
              Add a new character, environment, or item to your project.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
                  >
                    Element Type
                  </FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-none bg-[#131313] text-[#e5e2e1]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="border-[#353534] bg-[#1a1a1a] text-[#e5e2e1]">
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

            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
                  >
                    Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    className="border-none bg-[#131313] text-[#e5e2e1]"
                    placeholder="e.g. Elara Vance"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {type === "character" && (
              <Controller
                name="age"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
                    >
                      Age
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      className="border-none bg-[#131313] text-[#e5e2e1]"
                      placeholder="e.g. 28"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
                  >
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    className="min-h-[80px] border-none bg-[#131313] text-[#e5e2e1]"
                    placeholder="General description..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {type === "character" && (
              <>
                <Controller
                  name="appearance"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
                      >
                        Appearance
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        className="min-h-[80px] border-none bg-[#131313] text-[#e5e2e1]"
                        placeholder="Physical features..."
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
                        className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
                      >
                        Personality
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        className="min-h-[80px] border-none bg-[#131313] text-[#e5e2e1]"
                        placeholder="Traits, behaviors..."
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="text-[#e5e2e1]/50 hover:bg-[#353534] hover:text-[#e5e2e1]"
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-[#efcb61] text-[#3d2f00] hover:bg-[#d2af48]"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span>Create {type}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
