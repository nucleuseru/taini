"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useElementDetails } from "./context";

export function ElementDetailsReferenceImageDetails() {
  const { selectedRef, setSelectedRef } = useElementDetails();

  return (
    <Dialog
      open={!!selectedRef}
      onOpenChange={(open) => {
        if (!open) setSelectedRef(null);
      }}
    >
      <DialogContent className="border-[#353534] bg-[#1a1a1a] text-[#e5e2e1] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl font-bold tracking-tight">
            {selectedRef?.name}
          </DialogTitle>
          {selectedRef?.description && (
            <DialogDescription className="text-[#e5e2e1]/60">
              {selectedRef.description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-[#131313]">
          {selectedRef?.url && (
            <Image
              src={selectedRef.url}
              alt={selectedRef.name}
              fill
              className="object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
