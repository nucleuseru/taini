"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
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
  const [confirmState, setConfirmState] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    variant?: "default" | "destructive";
  } | null>(null);

  const imageIds = element.referenceImages.map((ref) => ref.imageId);
  const images = useQuery(api.image.getMany, { ids: imageIds });

  // Mutations
  const updateCharacter = useMutation(api.character.update);
  const updateEnvironment = useMutation(api.environment.update);
  const updateItem = useMutation(api.item.update);

  const removeCharacter = useMutation(api.character.remove);
  const removeEnvironment = useMutation(api.environment.remove);
  const removeItem = useMutation(api.item.remove);

  const generateImage = useMutation(api.image.generate);
  const uploadImage = useMutation(api.image.upload);
  const triggerInference = useMutation(api.image.triggerInference);

  const addRefCharacter = useMutation(api.character.addReferenceImages);
  const addRefEnvironment = useMutation(api.environment.addReferenceImages);
  const addRefItem = useMutation(api.item.addReferenceImages);

  const removeRefCharacter = useMutation(api.character.removeReferenceImage);
  const removeRefEnvironment = useMutation(
    api.environment.removeReferenceImage,
  );
  const removeRefItem = useMutation(api.item.removeReferenceImage);

  const generateUploadUrl = useMutation(api.upload.generateUrl);

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
      if (element.type === "character") {
        await updateCharacter({
          id: element._id,
          name: data.name,
          age: data.age,
          description: data.description,
          appearance: data.appearance,
          personality: data.personality,
        });
      } else if (element.type === "environment") {
        await updateEnvironment({
          id: element._id,
          name: data.name,
          description: data.description,
        });
      } else {
        await updateItem({
          id: element._id,
          name: data.name,
          description: data.description,
        });
      }
      toast.success("Details updated");
      form.reset(data);
    } catch (error) {
      console.error(error);
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
      let imageId: Id<"image">;

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

        const res = await generateImage({
          projectId,
          prompt,
          illustration: true,
        });
        imageId = res.imageId;
      } else if (addRefModal.file) {
        const file = addRefModal.file;
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = (await result.json()) as {
          storageId: Id<"_storage">;
        };

        const res = await uploadImage({
          projectId,
          storageId,
        });
        imageId = res.imageId;
      } else {
        return;
      }

      const refData = {
        imageId,
        name: data.name,
        description: data.description,
      };

      if (element.type === "character") {
        await addRefCharacter({ id: element._id, images: [refData] });
      } else if (element.type === "environment") {
        await addRefEnvironment({ id: element._id, images: [refData] });
      } else {
        await addRefItem({ id: element._id, images: [refData] });
      }

      toast.success(
        modalType === "generate" ? "Reference image queued" : "Image uploaded",
      );
      setAddRefModal(null);
      addRefForm.reset();
    } catch (error) {
      console.error(error);
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

      const { imageId: newImageId } = await generateImage({
        projectId,
        prompt,
        illustration: true,
      });

      const refData = {
        name: ref?.name ?? "Regenerated Ref",
        description: ref?.description ?? undefined,
        imageId: newImageId,
      };

      if (element.type === "character") {
        await addRefCharacter({ id: element._id, images: [refData] });
      } else if (element.type === "environment") {
        await addRefEnvironment({ id: element._id, images: [refData] });
      } else {
        await addRefItem({ id: element._id, images: [refData] });
      }

      await triggerInference({ id: newImageId });
      toast.success("Regeneration started. New version added.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to regenerate reference image");
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveImage = async (imageId: Id<"image">) => {
    setConfirmState({
      title: "Remove Reference Image",
      description: "Are you sure you want to remove this reference image?",
      variant: "destructive",
      onConfirm: async () => {
        setLoading(`remove-${imageId}`);
        try {
          if (element.type === "character") {
            await removeRefCharacter({ id: element._id, imageId });
          } else if (element.type === "environment") {
            await removeRefEnvironment({ id: element._id, imageId });
          } else {
            await removeRefItem({ id: element._id, imageId });
          }
          toast.success("Reference image removed");
          if (selectedRef?.imageId === imageId) setSelectedRef(null);
        } catch (error) {
          console.error(error);
          toast.error("Failed to remove image");
        } finally {
          setLoading(null);
        }
      },
    });
  };

  const handleDeleteElement = async () => {
    setConfirmState({
      title: `Delete ${element.type}`,
      description: `Are you sure you want to delete this ${element.type}? This action cannot be undone.`,
      variant: "destructive",
      onConfirm: async () => {
        setLoading("delete-element");
        try {
          if (element.type === "character") {
            await removeCharacter({ id: element._id });
          } else if (element.type === "environment") {
            await removeEnvironment({ id: element._id });
          } else {
            await removeItem({ id: element._id });
          }
          toast.success(`${element.type} deleted`);
          onClose();
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete element");
        } finally {
          setLoading(null);
        }
      },
    });
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
    handleRegenerate,
    handleRemoveImage,
    handleDeleteElement,
    handleFileChange,
    triggerInference,
    addRefCharacter,
    addRefEnvironment,
    addRefItem,
  };

  return (
    <ElementDetailsContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={!!confirmState}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        title={confirmState?.title ?? ""}
        description={confirmState?.description ?? ""}
        onConfirm={
          confirmState?.onConfirm
            ? () => void confirmState.onConfirm()
            : () => void 0
        }
        variant={confirmState?.variant}
      />
    </ElementDetailsContext.Provider>
  );
}
