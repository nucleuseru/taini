"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { useMutation, usePaginatedQuery } from "convex/react";
import { ImageIcon, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

export type UploadedImage = Doc<"image"> & {
  uploaded: true;
  url?: string | null;
};

export interface UploadedImageSelectorProps {
  label?: string;
  maxSelection?: number;
  projectId: Id<"project">;
  children: React.ReactNode;
  selectedImages: UploadedImage[];
  onSelect: (images: UploadedImage[]) => void;
}

export function UploadedImageSelector({
  projectId,
  selectedImages: selectedIds,
  onSelect,
  maxSelection = 1,
  label = "Select Image",
  children,
}: UploadedImageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useMutation(api.image.upload);
  const generateUploadUrl = useMutation(api.upload.generateUrl);

  const { results: images, status } = usePaginatedQuery(
    api.image.list,
    { projectId, uploaded: true },
    { initialNumItems: 50 },
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = (await result.json()) as {
        storageId: Id<"_storage">;
      };

      await uploadImage({ storageId, projectId });

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleSelection = (id: Id<"image">) => {
    if (selectedIds.find((image) => image._id === id)) {
      onSelect(selectedIds.filter((image) => image._id !== id));
    } else {
      if (maxSelection === 1) {
        onSelect([images.find((image) => image._id === id) as UploadedImage]);
        setOpen(false);
      } else if (selectedIds.length < maxSelection) {
        onSelect([
          ...selectedIds,
          images.find((image) => image._id === id) as UploadedImage,
        ]);
      } else {
        toast.error(
          `You can only select up to ${maxSelection.toString()} images`,
        );
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="bg-card border-border w-80 p-0 shadow-2xl"
        align="start"
      >
        <div className="border-border bg-muted/20 flex items-center justify-between border-b p-3">
          <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {label}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] tracking-wider uppercase"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 size={12} className="mr-1 animate-spin" />
            ) : (
              <Plus size={12} className="mr-1" />
            )}
            Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => void handleUpload(e)}
          />
        </div>

        <ScrollArea className="h-64 p-2">
          {status === "LoadingFirstPage" ? (
            <div className="flex h-full items-center justify-center p-8">
              <Loader2 className="text-muted-foreground animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <ImageIcon
                className="text-muted-foreground mb-2 opacity-20"
                size={32}
              />
              <p className="text-muted-foreground text-xs">
                No images uploaded yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <button
                  key={img._id}
                  onClick={() => {
                    toggleSelection(img._id);
                  }}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded border-2 transition-all",
                    selectedIds.find((image) => image._id === img._id)
                      ? "border-primary ring-primary/20 ring-2"
                      : "hover:border-muted-foreground/30 border-transparent",
                  )}
                >
                  {img.url && (
                    <Image
                      src={img.url}
                      alt="Gallery image"
                      className="object-cover"
                      width={100}
                      height={100}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
