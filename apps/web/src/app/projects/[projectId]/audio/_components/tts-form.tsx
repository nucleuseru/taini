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
import { Textarea } from "@/components/ui/textarea";
import { TTSFormSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Id } from "@repo/convex/dataModel";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

export interface TTSFormProps {
  projectId: Id<"project">;
}

export function TTSForm({
  projectId,
  children,
}: React.PropsWithChildren<TTSFormProps>) {
  const form = useForm({
    resolver: zodResolver(TTSFormSchema),
    defaultValues: {
      text: "",
      title: "",
      referenceVoice: "",
    },
  });

  const onSubmit = form.handleSubmit(async (formData) => {});

  return (
    <DrawerDialog>
      <DrawerDialogTrigger asChild>{children}</DrawerDialogTrigger>
      <DrawerDialogContent>
        <form onSubmit={(e) => void onSubmit(e)}>
          <DrawerDialogHeader>
            <DrawerDialogTitle>Generate Audio</DrawerDialogTitle>
            <DrawerDialogDescription>
              Give your project a name to get started with your film production.
            </DrawerDialogDescription>
          </DrawerDialogHeader>
          <div className="grid gap-4 py-4">
            <Controller
              name="title"
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

          <Controller
            name="text"
            control={form.control}
            render={({ field, fieldState }) => (
              <Textarea
                {...field}
                value={field.value}
                placeholder="Describe the speech or type the script..."
              />
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
