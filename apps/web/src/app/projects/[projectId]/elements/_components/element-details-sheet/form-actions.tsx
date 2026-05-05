"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2, Trash2 } from "lucide-react";
import { useElementDetails } from "./context";

export function ElementDetailsFormActions() {
  const { loading, form, onMetadataSubmit, handleDeleteElement } =
    useElementDetails();
  const isDirty = form.formState.isDirty;

  return (
    <div className="flex items-center justify-between border-t border-white/5 pt-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void handleDeleteElement()}
        disabled={loading === "delete-element"}
        className="h-10 gap-2 px-3 text-red-500/40 transition-all hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 size={14} />
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase">
          Discard
        </span>
      </Button>

      {isDirty && (
        <Button
          size="sm"
          onClick={() => void onMetadataSubmit()}
          disabled={!!loading}
          className="h-10 gap-2 bg-[#efcb61] px-5 text-[#3d2f00] shadow-xl shadow-[#efcb61]/5 transition-all hover:scale-[1.02] hover:bg-[#d2af48]"
        >
          {loading === "save-metadata" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} strokeWidth={3} />
          )}
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase">
            Update
          </span>
        </Button>
      )}
    </div>
  );
}
