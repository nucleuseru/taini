"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useElementDetails } from "./context";

export function ElementDetailsRoot({ children }: React.PropsWithChildren) {
  const { element, onClose } = useElementDetails();
  return (
    <Sheet
      open={!!element}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="w-full max-w-full! md:max-w-[400px]!">
        <ScrollArea className="flex h-full w-full flex-col gap-0 border-none bg-[#1a1a1a] p-0 text-[#e5e2e1]">
          <div className="overflow-y-auto p-6 pt-12">{children}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
