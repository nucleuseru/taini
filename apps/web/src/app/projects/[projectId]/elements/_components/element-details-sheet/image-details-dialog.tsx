"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RefreshCw, Trash2, Zap } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useElementDetails } from "./context";

export function ElementDetailsReferenceImageDetails() {
  const {
    selectedRef,
    setSelectedRef,
    images,
    triggerInference,
    handleRegenerate,
    handleRemoveImage,
  } = useElementDetails();
  const [isTriggering, setIsTriggering] = useState(false);

  const image = images?.find((img) => img._id === selectedRef?.imageId);
  const isPending = image?.status === "pending";

  const onTriggerInference = async () => {
    if (!selectedRef) return;
    setIsTriggering(true);
    try {
      await triggerInference({ id: selectedRef.imageId });
      toast.success("Inference triggered");
    } catch (error) {
      console.error(error);
      toast.error("Failed to trigger inference");
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <Dialog
      open={!!selectedRef}
      onOpenChange={(open) => {
        if (!open) setSelectedRef(null);
      }}
    >
      <DialogContent className="max-w-3xl overflow-hidden border-none bg-[#121212] p-0 text-[#e5e2e1] shadow-2xl sm:rounded-2xl">
        <div className="flex flex-col md:flex-row">
          <div className="relative aspect-square w-full bg-black/40 md:w-3/5">
            {selectedRef?.url ? (
              <Image
                src={selectedRef.url}
                alt={selectedRef.name}
                fill
                className="object-contain p-4"
                priority
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-[#e5e2e1]/20">
                {isPending ? (
                  <>
                    <Zap size={48} className="animate-pulse" />
                    <span className="text-sm font-medium tracking-widest uppercase">
                      Inference Pending
                    </span>
                  </>
                ) : (
                  <>
                    <Loader2 size={48} className="animate-spin" />
                    <span className="text-sm font-medium tracking-widest uppercase">
                      Processing Asset
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col p-8">
            <DialogHeader className="mb-8 space-y-3">
              <DialogTitle>{selectedRef?.name}</DialogTitle>
              {selectedRef?.description && (
                <DialogDescription>{selectedRef.description}</DialogDescription>
              )}
            </DialogHeader>

            <div className="mt-auto flex flex-col gap-3">
              {isPending && (
                <Button
                  onClick={() => void onTriggerInference()}
                  disabled={isTriggering}
                  className="h-12 w-full gap-2 bg-[#efcb61] text-[12px] font-bold tracking-widest text-[#3d2f00] uppercase transition-all hover:scale-[1.02] hover:bg-[#d2af48]"
                >
                  {isTriggering ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Zap size={16} fill="currentColor" />
                  )}
                  Trigger Inference
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    selectedRef && void handleRegenerate(selectedRef.imageId)
                  }
                  className="h-11 gap-2 border-white/5 bg-white/5 text-[10px] font-bold tracking-widest text-white/70 uppercase transition-all hover:bg-white/10 hover:text-white"
                >
                  <RefreshCw size={14} />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    selectedRef && void handleRemoveImage(selectedRef.imageId)
                  }
                  className="h-11 gap-2 border-red-500/10 bg-red-500/5 text-[10px] font-bold tracking-widest text-red-400 uppercase transition-all hover:bg-red-500/20 hover:text-red-300"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
