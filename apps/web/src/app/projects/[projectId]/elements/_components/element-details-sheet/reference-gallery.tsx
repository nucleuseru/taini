"use client";

import { Button } from "@/components/ui/button";
import {
  UploadedImage,
  UploadedImageSelector,
} from "@/components/uploaded-image-selector";
import { cn } from "@/lib/utils";
import { Loader2, Plus, RefreshCw, Trash2, Zap } from "lucide-react";
import Image from "next/image";
import { useElementDetails } from "./context";

export function ElementDetailsReferenceGallery() {
  const {
    element,
    images,
    loading,
    handleRegenerate,
    handleRemoveImage,
    setSelectedRef,
    setAddRefModal,
    addRefForm,
    projectId,
    addRefCharacter,
    addRefEnvironment,
    addRefItem,
  } = useElementDetails();

  const handleSelectExisting = async (selectedImages: UploadedImage[]) => {
    if (selectedImages.length === 0) return;

    try {
      const refData = selectedImages.map((img) => ({
        imageId: img._id,
        name: "Uploaded Ref",
        description: "",
      }));

      if (element.type === "character") {
        await addRefCharacter({ id: element._id, images: refData });
      } else if (element.type === "environment") {
        await addRefEnvironment({ id: element._id, images: refData });
      } else {
        await addRefItem({ id: element._id, images: refData });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 pt-10">
      <div className="flex items-center justify-between px-1">
        <div className="text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase">
          Reference Assets
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
        {images?.map((image) => {
          const refMetadata = element.referenceImages.find(
            (r) => r.imageId === image._id,
          );
          const isPending = image.status === "pending";

          return (
            <div
              key={image._id}
              className="group relative aspect-3/4 overflow-hidden rounded-xl bg-[#131313] transition-all hover:ring-2 hover:ring-white/10"
            >
              {image.url ? (
                <Image
                  src={image.url}
                  alt={refMetadata?.name ?? "Ref"}
                  fill
                  className="cursor-pointer object-cover transition-transform duration-500 group-hover:scale-110"
                  onClick={() => {
                    setSelectedRef({
                      imageId: image._id,
                      name: refMetadata?.name ?? "Untitled",
                      url: image.url ?? undefined,
                      description: refMetadata?.description ?? undefined,
                    });
                  }}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#1a1a1a]">
                  {isPending ? (
                    <Zap
                      size={20}
                      className="animate-pulse text-[#efcb61]/40"
                    />
                  ) : (
                    <Loader2 size={20} className="animate-spin text-white/10" />
                  )}
                  <span className="text-[8px] font-bold tracking-widest text-white/20 uppercase">
                    {isPending ? "Pending" : "Processing"}
                  </span>
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-x-0 bottom-0 flex translate-y-2 flex-col gap-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="mb-1 truncate text-[10px] font-bold tracking-wide text-white">
                  {refMetadata?.name ?? "Untitled"}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleRegenerate(image._id);
                    }}
                    disabled={!!loading}
                    className="h-8 w-8 rounded-lg bg-white/5 text-white/60 backdrop-blur-md transition-all hover:bg-white/20 hover:text-[#efcb61]"
                  >
                    <RefreshCw
                      size={12}
                      className={cn(
                        loading === `regenerate-${image._id}` && "animate-spin",
                      )}
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleRemoveImage(image._id);
                    }}
                    disabled={!!loading}
                    className="h-8 w-8 rounded-lg bg-red-500/10 text-red-400 backdrop-blur-md transition-all hover:bg-red-500/20 hover:text-red-300"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        <Button
          variant="ghost"
          className="flex aspect-3/4 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/5 bg-white/2 transition-all hover:border-white/10 hover:bg-white/5 hover:text-[#efcb61]"
          onClick={() => {
            setAddRefModal({ type: "generate" });
            addRefForm.reset({
              name: "Reference Concept",
              description: "",
            });
          }}
          disabled={!!loading}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 shadow-inner transition-transform group-hover:scale-110">
            <Plus size={18} />
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
            Generate
          </span>
        </Button>

        <UploadedImageSelector
          projectId={projectId}
          selectedImages={[]}
          onSelect={(imgs) => void handleSelectExisting(imgs)}
          maxSelection={5}
          label="Library Assets"
        >
          <Button
            variant="ghost"
            className="flex aspect-3/4 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/5 bg-white/2 transition-all hover:border-white/10 hover:bg-white/5 hover:text-[#efcb61]"
            disabled={!!loading}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 shadow-inner transition-transform group-hover:scale-110">
              <Plus size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
              Library
            </span>
          </Button>
        </UploadedImageSelector>
      </div>
    </div>
  );
}
