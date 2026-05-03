"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2, Trash2 } from "lucide-react";
import { useElementDetails } from "./context";

export function ElementDetailsFormActions() {
  const { element, loading, form, onMetadataSubmit, handleDeleteElement } =
    useElementDetails();
  const isDirty = form.formState.isDirty;

  return (
    <div className="flex items-center justify-between border-t border-[#353534]/50 pt-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void handleDeleteElement()}
        disabled={loading === "delete-element"}
        className="h-9 gap-2 text-red-500/50 transition-colors hover:bg-red-500/10 hover:text-red-500"
      >
        <Trash2 size={16} />
        <span className="text-[10px] font-bold tracking-wider uppercase">
          Delete {element.type}
        </span>
      </Button>

      {isDirty && (
        <Button
          size="sm"
          onClick={() => void onMetadataSubmit()}
          disabled={!!loading}
          className="h-9 gap-2 bg-[#efcb61] px-4 text-[#3d2f00] transition-all hover:bg-[#d2af48]"
        >
          {loading === "save-metadata" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          <span className="text-[10px] font-bold tracking-wider uppercase">
            Save Changes
          </span>
        </Button>
      )}
    </div>
  );
}
