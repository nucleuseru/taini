"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Plus, RefreshCw, Trash2, Upload, Zap } from "lucide-react";
import Image from "next/image";
import { useElementDetails } from "./context";

export function ElementDetailsReferenceGallery() {
  const {
    element,
    images,
    loading,
    handleTriggerInference,
    handleRegenerate,
    handleRemoveImage,
    setSelectedRef,
    setAddRefModal,
    addRefForm,
    fileInputRef,
    handleFileChange,
  } = useElementDetails();

  return (
    <div className="space-y-4 pt-8">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold tracking-wider text-[#e5e2e1]/50 uppercase">
          Reference Images
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void handleTriggerInference()}
            disabled={!!loading}
            className="h-8 gap-2 text-[10px] tracking-wider text-[#efcb61] uppercase hover:bg-[#efcb61]/10"
          >
            <Zap size={12} />
            Generate All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {images?.map((image) => {
          const refMetadata = element.referenceImages.find(
            (r) => r.imageId === image._id,
          );
          return (
            <div
              key={image._id}
              className="group relative aspect-square overflow-hidden rounded-sm bg-[#131313]"
            >
              {image.url ? (
                <Image
                  src={image.url}
                  alt={refMetadata?.name ?? "Ref"}
                  fill
                  className="cursor-pointer object-cover transition-transform group-hover:scale-105"
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
                <div className="flex h-full w-full items-center justify-center">
                  {image.status === "pending" ? (
                    <div className="text-[10px] tracking-wider text-[#e5e2e1]/30 uppercase">
                      Pending
                    </div>
                  ) : (
                    <Loader2
                      size={24}
                      className="animate-spin text-[#353534]"
                    />
                  )}
                </div>
              )}

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => void handleRegenerate(image._id)}
                  disabled={!!loading}
                  className="h-8 w-8 bg-black/40 text-[#e5e2e1] backdrop-blur-sm transition-all hover:bg-[#2a2a2a] hover:text-[#efcb61]"
                >
                  <RefreshCw
                    size={14}
                    className={
                      loading === `regenerate-${image._id}`
                        ? "animate-spin"
                        : ""
                    }
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => void handleRemoveImage(image._id)}
                  disabled={!!loading}
                  className="h-8 w-8 bg-black/40 text-red-500/80 backdrop-blur-sm transition-all hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              {refMetadata?.name && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <div className="truncate text-[10px] font-medium text-[#e5e2e1]">
                    {refMetadata.name}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex aspect-square flex-col gap-2">
          <Button
            variant="ghost"
            className="flex flex-1 flex-col items-center justify-center gap-2 border border-dashed border-[#353534] bg-[#131313]/50 transition-all hover:bg-[#131313] hover:text-[#efcb61]"
            onClick={() => {
              setAddRefModal({ type: "generate" });
              addRefForm.reset({
                name: "Generated Ref",
                description: "",
              });
            }}
            disabled={!!loading}
          >
            <Plus size={16} />
            <span className="text-[10px] tracking-wider uppercase">
              New Gen
            </span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-1 flex-col items-center justify-center gap-2 border border-dashed border-[#353534] bg-[#131313]/50 transition-all hover:bg-[#131313] hover:text-[#efcb61]"
            onClick={() => fileInputRef.current?.click()}
            disabled={!!loading}
          >
            <Upload size={16} />
            <span className="text-[10px] tracking-wider uppercase">Upload</span>
          </Button>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}
