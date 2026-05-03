"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  generateElementReferenceImage,
  GenerateElementReferenceImageOptions,
  getUploadUrl,
  regenerateReferenceImage,
  RegenerateReferenceImageOptions,
  removeElement,
  RemoveElementOptions,
  removeReferenceImage,
  RemoveReferenceImageOptions,
  triggerElementInference,
  updateElement,
  UpdateElementOptions,
  uploadElementReferenceImage,
  UploadElementReferenceImageOptions,
} from "../../actions";
import {
  AddRefSchema,
  AddRefValues,
  ElementDetailsContextValue,
  ElementDetailsSheetProps,
  LoadingState,
  MetadataFormSchema,
  MetadataFormValues,
} from "./types";

const ElementDetailsContext = createContext<ElementDetailsContextValue | null>(
  null,
);

export function useElementDetails() {
  const context = useContext(ElementDetailsContext);
  if (!context) {
    throw new Error(
      "useElementDetails must be used within an ElementDetailsProvider",
    );
  }
  return context;
}

export function ElementDetailsProvider({
  children,
  element,
  onClose,
}: React.PropsWithChildren<ElementDetailsSheetProps>) {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<LoadingState>(null);
  const [selectedRef, setSelectedRef] =
    useState<ElementDetailsContextValue["selectedRef"]>(null);
  const [addRefModal, setAddRefModal] =
    useState<ElementDetailsContextValue["addRefModal"]>(null);

  const imageIds = element.referenceImages.map((ref) => ref.imageId);
  const images = useQuery(api.image.getMany, { ids: imageIds });

  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(MetadataFormSchema),
    defaultValues: {
      name: element.name,
      age: element.type === "character" ? (element.age ?? "") : "",
      description: element.description ?? "",
      appearance:
        element.type === "character" ? (element.appearance ?? "") : "",
      personality:
        element.type === "character" ? (element.personality ?? "") : "",
    },
  });

  const addRefForm = useForm<AddRefValues>({
    resolver: zodResolver(AddRefSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Update form when element changes
  useEffect(() => {
    form.reset({
      name: element.name,
      age: element.type === "character" ? (element.age ?? "") : "",
      description: element.description ?? "",
      appearance:
        element.type === "character" ? (element.appearance ?? "") : "",
      personality:
        element.type === "character" ? (element.personality ?? "") : "",
    });
  }, [element, form]);

  const onMetadataSubmit = form.handleSubmit(async (data) => {
    setLoading("save-metadata");
    try {
      const res = await updateElement({
        type: element.type,
        id: element._id,
        ...data,
      } as UpdateElementOptions);
      if (res.success) {
        toast.success("Details updated");
        form.reset(data);
      } else {
        toast.error(res.error ?? "Failed to update details");
      }
    } catch {
      toast.error("Failed to update details");
    } finally {
      setLoading(null);
    }
  });

  const onAddRefSubmit = addRefForm.handleSubmit(async (data) => {
    if (!addRefModal) return;

    const modalType = addRefModal.type;
    setLoading(modalType);

    try {
      if (modalType === "generate") {
        const promptParts = [
          data.name,
          data.description,
          form.getValues().name,
          form.getValues().description,
          form.getValues().appearance,
          form.getValues().personality,
        ].filter(Boolean);
        const prompt = promptParts.join(", ");

        const res = await generateElementReferenceImage({
          projectId,
          id: element._id,
          type: element.type,
          prompt,
          name: data.name,
          description: data.description,
        } as GenerateElementReferenceImageOptions);

        if (res.success) {
          toast.success("Reference image queued");
          setAddRefModal(null);
          addRefForm.reset();
        } else {
          toast.error(res.error ?? "Failed to generate reference image");
        }
      } else if (addRefModal.file) {
        const file = addRefModal.file;
        const uploadUrl = await getUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = (await result.json()) as Record<
          "storageId",
          Id<"_storage">
        >;

        const res = await uploadElementReferenceImage({
          projectId,
          storageId,
          id: element._id,
          type: element.type,
          name: data.name,
          description: data.description,
        } as UploadElementReferenceImageOptions);

        if (res.success) {
          toast.success("Image uploaded successfully");
          setAddRefModal(null);
          addRefForm.reset();
        } else {
          toast.error(res.error ?? "Failed to upload reference image");
        }
      }
    } catch {
      toast.error(`Failed to ${modalType}`);
    } finally {
      setLoading(null);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddRefModal({ type: "upload", file });
    addRefForm.reset({ name: file.name, description: "" });
  };

  const handleTriggerInference = async () => {
    const pendingImageIds =
      images?.filter((img) => img.status === "pending").map((img) => img._id) ??
      [];

    if (pendingImageIds.length === 0) {
      toast.info("No pending images to generate");
      return;
    }

    setLoading("inference");
    try {
      const res = await triggerElementInference(pendingImageIds);
      if (res.success) {
        toast.success("Inference triggered for all pending assets");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to trigger inference");
    } finally {
      setLoading(null);
    }
  };

  const handleRegenerate = async (imageId: Id<"image">) => {
    setLoading(`regenerate-${imageId}`);
    try {
      const ref = element.referenceImages.find((r) => r.imageId === imageId);
      const promptParts = [
        ref?.name,
        ref?.description,
        element.name,
        element.description,
        element.type === "character" ? element.appearance : "",
        element.type === "character" ? element.personality : "",
      ].filter(Boolean);
      const prompt = promptParts.join(", ");

      const res = await regenerateReferenceImage({
        projectId,
        id: element._id,
        type: element.type,
        oldImageId: imageId,
        prompt,
        name: ref?.name ?? "Regenerated Ref",
        description: ref?.description ?? undefined,
      } as RegenerateReferenceImageOptions);

      if (res.success) {
        toast.success("Reference image regeneration started");
      } else {
        toast.error(res.error ?? "Failed to regenerate reference image");
      }
    } catch {
      toast.error("Failed to regenerate reference image");
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveImage = async (imageId: Id<"image">) => {
    if (!confirm("Are you sure you want to remove this reference image?"))
      return;

    setLoading(`remove-${imageId}`);

    try {
      const res = await removeReferenceImage({
        imageId,
        id: element._id,
        type: element.type,
      } as RemoveReferenceImageOptions);

      if (res.success) {
        toast.success("Reference image removed");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to remove image");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteElement = async () => {
    if (
      !confirm(
        `Are you sure you want to delete this ${element.type}? This action cannot be undone.`,
      )
    )
      return;

    setLoading("delete-element");
    try {
      const res = await removeElement({
        id: element._id,
        type: element.type,
      } as RemoveElementOptions);

      if (res.success) {
        toast.success(`${element.type} deleted`);
        onClose();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to delete element");
    } finally {
      setLoading(null);
    }
  };

  const value: ElementDetailsContextValue = {
    element,
    projectId,
    loading,
    selectedRef,
    addRefModal,
    images,
    form,
    addRefForm,
    fileInputRef,
    onClose,
    setLoading,
    setSelectedRef,
    setAddRefModal,
    onMetadataSubmit,
    onAddRefSubmit,
    handleTriggerInference,
    handleRegenerate,
    handleRemoveImage,
    handleDeleteElement,
    handleFileChange,
  };

  return (
    <ElementDetailsContext.Provider value={value}>
      {children}
    </ElementDetailsContext.Provider>
  );
}
