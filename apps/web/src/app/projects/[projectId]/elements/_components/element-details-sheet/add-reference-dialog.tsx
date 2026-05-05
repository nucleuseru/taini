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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { Controller } from "react-hook-form";
import { useElementDetails } from "./context";

export function ElementDetailsAddReferenceModal() {
  const { addRefModal, setAddRefModal, loading, addRefForm, onAddRefSubmit } =
    useElementDetails();

  const isGenerating = addRefModal?.type === "generate";

  return (
    <Dialog
      open={!!addRefModal}
      onOpenChange={(open) => {
        if (!open) setAddRefModal(null);
      }}
    >
      <DialogContent className="max-w-[440px] border-none bg-[#121212] p-8 text-[#e5e2e1] shadow-2xl sm:rounded-2xl">
        <form onSubmit={(e) => void onAddRefSubmit(e)} className="space-y-8">
          <DialogHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
              {isGenerating ? (
                <Sparkles size={20} className="text-[#efcb61]" />
              ) : (
                <Upload size={20} className="text-[#efcb61]" />
              )}
            </div>
            <DialogTitle className="font-headline text-2xl font-bold tracking-tight text-white">
              {isGenerating ? "Generate Reference" : "Upload Reference"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[#e5e2e1]/40">
              {isGenerating
                ? "Define the conceptual metadata for this generated reference asset."
                : "Provide a context for this reference image upload."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Controller
              name="name"
              control={addRefForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                  >
                    Asset Identity
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    autoFocus
                    className="h-11 border-none bg-white/3 text-sm font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
                    placeholder="e.g. Profile Silhouette"
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
                    className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                  >
                    Contextual Details
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    className="min-h-[100px] border-none bg-white/3 text-sm leading-relaxed font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
                    placeholder="Describe specific features or intent..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              className="h-11 text-[10px] font-bold tracking-widest text-white/30 uppercase hover:bg-white/5 hover:text-white"
              disabled={!!loading}
              onClick={() => {
                setAddRefModal(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!!loading}
              className="h-11 min-w-[120px] bg-[#efcb61] text-[10px] font-bold tracking-widest text-[#3d2f00] uppercase transition-all hover:scale-[1.02] hover:bg-[#d2af48]"
            >
              {loading === addRefModal?.type ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>{isGenerating ? "Initialize" : "Upload"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
