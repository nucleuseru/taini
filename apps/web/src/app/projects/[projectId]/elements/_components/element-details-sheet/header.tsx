"use client";

import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Mountain, Package, User } from "lucide-react";
import { useElementDetails } from "./context";

export function ElementDetailsHeader() {
  const { element } = useElementDetails();

  const Icon =
    element.type === "character"
      ? User
      : element.type === "environment"
        ? Mountain
        : Package;

  return (
    <SheetHeader className="mb-12 flex flex-row items-center justify-between space-y-0 px-1 pt-4">
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 shadow-inner">
          <Icon size={20} className="text-[#efcb61] opacity-80" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="text-[10px] font-bold tracking-[0.2em] text-[#efcb61] uppercase">
            {element.type}
          </div>
          <SheetTitle className="font-headline text-xl font-bold tracking-tight text-white">
            {element.name}
          </SheetTitle>
        </div>
      </div>
    </SheetHeader>
  );
}
