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
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { useElementDetails } from "./context";

export function ElementDetailsAddReferenceModal() {
  const { addRefModal, setAddRefModal, loading, addRefForm, onAddRefSubmit } =
    useElementDetails();

  return (
    <Dialog
      open={!!addRefModal}
      onOpenChange={(open) => {
        if (!open) setAddRefModal(null);
      }}
    >
      <DialogContent className="border-[#353534] bg-[#1a1a1a] text-[#e5e2e1] sm:max-w-[425px]">
        <form onSubmit={(e) => void onAddRefSubmit(e)}>
          <DialogHeader>
            <DialogTitle className="font-headline text-xl font-bold tracking-tight">
              {addRefModal?.type === "generate"
                ? "Generate Reference"
                : "Upload Reference"}
            </DialogTitle>
            <DialogDescription className="text-[#e5e2e1]/50">
              {addRefModal?.type === "generate"
                ? "Define the metadata for the generated reference image."
                : "Give your uploaded reference a name and description."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Controller
              name="name"
              control={addRefForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
                  >
                    Reference Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    className="border-none bg-[#131313] text-[#e5e2e1]"
                    placeholder="e.g. Portrait Sketch"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={addRefForm.control}
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
                    placeholder="Optional details..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="text-[#e5e2e1]/50 hover:bg-[#353534] hover:text-[#e5e2e1]"
                disabled={!!loading}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!!loading}
              className="bg-[#efcb61] text-[#3d2f00] hover:bg-[#d2af48]"
            >
              {loading === addRefModal?.type && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span>
                {addRefModal?.type === "generate" ? "Generate" : "Upload"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
