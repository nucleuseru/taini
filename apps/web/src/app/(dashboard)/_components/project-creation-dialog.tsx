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
import { CreateProjectFormSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createProject } from "../actions";

export function ProjectCreationDialog() {
  const form = useForm({
    resolver: zodResolver(CreateProjectFormSchema),
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
          <Plus className="size-4" />
          New Project
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>Create New Project</DrawerDialogTitle>
          <DrawerDialogDescription>
            Give your project a name to get started with your film production.
          </DrawerDialogDescription>
        </DrawerDialogHeader>
        <form onSubmit={(e) => void onSubmit(e)}>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="px-4 pb-4 md:px-0"
              >
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
                <Loader2 className="size-4 animate-spin" />
              )}
              <span>Create Project</span>
            </Button>
          </DrawerDialogFooter>
        </form>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
