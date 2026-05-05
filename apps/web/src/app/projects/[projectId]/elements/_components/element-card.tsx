"use client";

import { api } from "@repo/convex/api";
import { useQuery } from "convex/react";
import { MountainIcon, PackageIcon, UserIcon, Zap } from "lucide-react";
import Image from "next/image";
import { Element } from "./element-details-sheet/types";

export type ElementCardProps = Element & {
  onClick: () => void;
};

export function ElementCard({
  name,
  type,
  onClick,
  referenceImages,
}: ElementCardProps) {
  const firstImageId = referenceImages[0]?.imageId;
  const image = useQuery(
    api.image.get,
    firstImageId ? { id: firstImageId } : "skip",
  );

  const Icon =
    type === "character"
      ? UserIcon
      : type === "environment"
        ? MountainIcon
        : PackageIcon;

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#0f0f0f] ring-1 ring-white/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black hover:ring-white/10"
      onClick={onClick}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {image?.url ? (
          <Image
            src={image.url}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : firstImageId && (!image || image.status === "pending") ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#131313]">
            <Zap size={24} className="animate-pulse text-[#efcb61]/40" />
            <span className="text-[9px] font-bold tracking-[0.2em] text-white/20 uppercase">
              Inference Pending
            </span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#131313]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Icon size={24} className="text-white/20" />
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] via-[#0f0f0f]/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-40" />
      </div>

      <div className="absolute top-4 right-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 ring-1 ring-white/10 backdrop-blur-xl transition-colors group-hover:bg-[#efcb61]/10 group-hover:ring-[#efcb61]/20">
          <Icon
            size={14}
            className="text-white/60 transition-colors group-hover:text-[#efcb61]"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-bold tracking-[0.2em] text-[#efcb61] uppercase">
            {type}
          </div>
          <h3 className="font-headline truncate text-lg font-bold tracking-tight text-white transition-colors group-hover:text-[#efcb61]">
            {name}
          </h3>
        </div>
      </div>
    </div>
  );
}
