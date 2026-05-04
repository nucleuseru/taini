"use client";

import { Button } from "@/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogClose,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/ui/drawer-dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createProject } from "../actions";

const FormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
});

export function ProjectCreationDialog() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = form.handleSubmit(async (formData) => {
    const error = await createProject(formData.name);
    toast.error(error);
  });

  return (
    <DrawerDialog>
      <DrawerDialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <form onSubmit={(e) => void onSubmit(e)}>
          <DrawerDialogHeader>
            <DrawerDialogTitle>Create New Project</DrawerDialogTitle>
            <DrawerDialogDescription>
              Give your project a name to get started with your film production.
            </DrawerDialogDescription>
          </DrawerDialogHeader>
          <div className="grid gap-4 py-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Project Name</FieldLabel>
                  <Input
                    {...field}
                    autoFocus
                    type="text"
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. My Awesome Sci-Fi Film"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <DrawerDialogFooter>
            <DrawerDialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </DrawerDialogClose>
            <Button disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span>Create Project</span>
            </Button>
          </DrawerDialogFooter>
        </form>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
