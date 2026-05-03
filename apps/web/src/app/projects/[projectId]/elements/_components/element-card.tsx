"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@repo/convex/api";
import { useQuery } from "convex/react";
import { MountainIcon, PackageIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import { ElementType } from "../actions";
import { Element } from "./element-details-sheet/types";

export type ElementCardProps = Element & {
  type: ElementType;
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
      className="group relative cursor-pointer overflow-hidden rounded-md transition-transform hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative aspect-square bg-[#131313]">
        {image?.url ? (
          <Image
            src={image.url}
            width={image.width ?? 1024}
            height={image.height ?? 1024}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : firstImageId && (!image || image.status === "generating") ? (
          <Skeleton className="bg-card h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a]">
            <Icon size={48} className="text-[#353534]" />
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-sm border border-[#353534] bg-[#131313]/80 backdrop-blur-md">
          <Icon size={12} className="text-[#e5e2e1]" />
        </span>
      </div>

      <div className="bg-card/50 absolute inset-x-0 bottom-0 p-3 backdrop-blur-sm">
        <h3 className="truncate text-sm font-medium text-[#e5e2e1]">{name}</h3>
        <p className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase">
          {type}
        </p>
      </div>
    </div>
  );
}
