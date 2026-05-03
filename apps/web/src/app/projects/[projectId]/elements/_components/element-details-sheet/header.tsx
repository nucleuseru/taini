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
    <SheetHeader className="mb-8 flex flex-row items-center justify-between space-y-0 px-0">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#131313]">
          <Icon size={24} className="text-[#efcb61]" />
        </div>
        <div>
          <SheetTitle className="font-headline text-2xl font-bold tracking-tight text-[#e5e2e1]">
            {element.name}
          </SheetTitle>
          <div className="text-[10px] font-semibold tracking-wider text-[#efcb61] uppercase">
            {element.type}
          </div>
        </div>
      </div>
    </SheetHeader>
  );
}
