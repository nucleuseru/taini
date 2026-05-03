import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { useQuery } from "convex/react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export type ElementType = "character" | "environment" | "item";

export type CharacterElement = Doc<"character"> & { type: "character" };
export type EnvironmentElement = Doc<"environment"> & { type: "environment" };
export type ItemElement = Doc<"item"> & { type: "item" };

export type Element = CharacterElement | EnvironmentElement | ItemElement;

export interface ElementDetailsSheetProps {
  element: Element;
  onClose: () => void;
}

export const MetadataFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.string().optional(),
  description: z.string().optional(),
  appearance: z.string().optional(),
  personality: z.string().optional(),
});

export type MetadataFormValues = z.infer<typeof MetadataFormSchema>;

export const AddRefSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type AddRefValues = z.infer<typeof AddRefSchema>;

export type LoadingState =
  | "save-metadata"
  | "generate"
  | "upload"
  | "inference"
  | "delete-element"
  | `regenerate-${Id<"image">}`
  | `remove-${Id<"image">}`
  | null;

export interface ElementDetailsContextValue {
  element: Element;
  projectId: Id<"project">;
  loading: LoadingState;
  selectedRef: {
    imageId: Id<"image">;
    name: string;
    description?: string;
    url?: string;
  } | null;
  addRefModal: {
    type: "generate" | "upload";
    file?: File;
  } | null;
  images: ReturnType<typeof useQuery<typeof api.image.getMany>> | undefined;
  form: UseFormReturn<MetadataFormValues>;
  addRefForm: UseFormReturn<AddRefValues>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Actions
  onClose: () => void;
  setLoading: (state: LoadingState) => void;
  setSelectedRef: (ref: ElementDetailsContextValue["selectedRef"]) => void;
  setAddRefModal: (modal: ElementDetailsContextValue["addRefModal"]) => void;
  onMetadataSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onAddRefSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleTriggerInference: () => Promise<void>;
  handleRegenerate: (imageId: Id<"image">) => Promise<void>;
  handleRemoveImage: (imageId: Id<"image">) => Promise<void>;
  handleDeleteElement: () => Promise<void>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
