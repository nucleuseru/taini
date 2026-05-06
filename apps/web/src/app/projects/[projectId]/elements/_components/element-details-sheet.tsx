"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogTitle,
} from "@/components/ui/drawer-dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { UploadedImageSelector } from "@/components/uploaded-image-selector";
import {
  AddReferenceSchema,
  CreateElementFormSchema,
  ReferenceImageSchema,
} from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@repo/convex/api";
import { Doc, Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  Check,
  Loader2,
  Mountain,
  Package,
  Plus,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export type Element =
  | ({ type: "character" } & Doc<"character">)
  | ({ type: "environment" } & Doc<"environment">)
  | ({ type: "item" } & Doc<"item">);

export interface ReferenceImage {
  name: string;
  description?: string;
  imageId: Id<"image">;
}

export interface ElementDetailsSheetProps {
  element: Element | null;
  onClose: () => void;
}

export function ElementDetailsSheet({
  element,
  onClose,
}: ElementDetailsSheetProps) {
  const { control, handleSubmit, reset, ...form } = useForm<
    z.infer<typeof CreateElementFormSchema>
  >({
    resolver: zodResolver(CreateElementFormSchema),
    defaultValues: {
      type: element?.type ?? "character",
      name: element?.name ?? "",
      description: element?.description ?? "",
      age: element?.type === "character" ? (element.age ?? "") : "",
      appearance:
        element?.type === "character" ? (element.appearance ?? "") : "",
      personality:
        element?.type === "character" ? (element.personality ?? "") : "",
    },
  });

  useEffect(() => {
    if (element) {
      reset({
        type: element.type,
        name: element.name,
        description: element.description ?? "",
        age: (element.type === "character" ? element.age : "") ?? "",
        appearance:
          (element.type === "character" ? element.appearance : "") ?? "",
        personality:
          (element.type === "character" ? element.personality : "") ?? "",
      });
    }
  }, [element, reset]);

  const [isSaving, setIsSaving] = useState(false);
  const [selectedRefIndex, setSelectedRefIndex] = useState<number | null>(null);
  const [isAddRefOpen, setIsAddRefOpen] = useState(false);

  const updateCharacter = useMutation(api.character.update);
  const updateEnvironment = useMutation(api.environment.update);
  const updateItem = useMutation(api.item.update);
  const removeCharacter = useMutation(api.character.remove);
  const removeEnvironment = useMutation(api.environment.remove);
  const removeItem = useMutation(api.item.remove);

  if (!element) return null;

  const onSave = async (data: z.infer<typeof CreateElementFormSchema>) => {
    setIsSaving(true);
    try {
      if (element.type === "character") {
        await updateCharacter({
          id: element._id as Id<"character">,
          name: data.name,
          description: data.description,
          age: data.age,
          appearance: data.appearance,
          personality: data.personality,
        });
      } else if (element.type === "environment") {
        await updateEnvironment({
          id: element._id as Id<"environment">,
          name: data.name,
          description: data.description,
        });
      } else {
        await updateItem({
          id: element._id as Id<"item">,
          name: data.name,
          description: data.description,
        });
      }
      toast.success("Details updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (element.type === "character")
        await removeCharacter({ id: element._id as Id<"character"> });
      else if (element.type === "environment")
        await removeEnvironment({
          id: element._id as Id<"environment">,
        });
      else await removeItem({ id: element._id as Id<"item"> });
      toast.success("Element deleted");
      onClose();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const Icon =
    element.type === "character"
      ? User
      : element.type === "environment"
        ? Mountain
        : Package;

  return (
    <Sheet
      open={!!element}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="w-full! p-0 md:w-auto!">
        <ScrollArea className="h-svh">
          <div className="space-y-8 p-6 pt-12 pb-24">
            <SheetHeader className="flex flex-row items-center gap-4 space-y-0 p-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Icon size={20} className="text-[#efcb61]" />
              </div>
              <div className="flex flex-col">
                <div className="text-[10px] font-bold tracking-[0.2em] text-[#efcb61] uppercase">
                  {element.type}
                </div>
                <SheetTitle className="text-xl text-white">
                  {element.name}
                </SheetTitle>
              </div>
            </SheetHeader>

            <form
              onSubmit={(e) => void handleSubmit(onSave)(e)}
              className="space-y-6"
            >
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-[10px] tracking-widest text-white/30 uppercase">
                      Name
                    </FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="border-none bg-white/5"
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-[10px]"
                      />
                    )}
                  </Field>
                )}
              />

              {element.type === "character" && (
                <Controller
                  name="age"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[10px] tracking-widest text-white/30 uppercase">
                        Age / Era
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        className="border-none bg-white/5"
                      />
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className="text-[10px]"
                        />
                      )}
                    </Field>
                  )}
                />
              )}

              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-[10px] tracking-widest text-white/30 uppercase">
                      Description
                    </FieldLabel>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="min-h-[100px] border-none bg-white/5"
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-[10px]"
                      />
                    )}
                  </Field>
                )}
              />

              {element.type === "character" && (
                <>
                  <Controller
                    name="appearance"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-[10px] tracking-widest text-white/30 uppercase">
                          Appearance
                        </FieldLabel>
                        <Textarea
                          {...field}
                          aria-invalid={fieldState.invalid}
                          className="border-none bg-white/5"
                        />
                        {fieldState.invalid && (
                          <FieldError
                            errors={[fieldState.error]}
                            className="text-[10px]"
                          />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="personality"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-[10px] tracking-widest text-white/30 uppercase">
                          Personality
                        </FieldLabel>
                        <Textarea
                          {...field}
                          aria-invalid={fieldState.invalid}
                          className="border-none bg-white/5"
                        />
                        {fieldState.invalid && (
                          <FieldError
                            errors={[fieldState.error]}
                            className="text-[10px]"
                          />
                        )}
                      </Field>
                    )}
                  />
                </>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSaving || !form.formState.isDirty}
                  className="flex-1"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Update
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    void handleDelete();
                  }}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              <div className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
                Reference Images
              </div>
              <div className="grid grid-cols-3 gap-2">
                {element.referenceImages.map((ref, idx) => (
                  <ReferenceImageThumb
                    key={idx}
                    refData={ref}
                    onClick={() => {
                      setSelectedRefIndex(idx);
                    }}
                  />
                ))}
                <Button
                  variant="ghost"
                  className="gap-2 border border-dashed border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => {
                    setIsAddRefOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span className="text-[8px] tracking-widest uppercase">
                    Add
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>

      <ImageDetailsModal
        element={element}
        refIndex={selectedRefIndex}
        onClose={() => {
          setSelectedRefIndex(null);
        }}
      />

      <AddReferenceModal
        element={element}
        open={isAddRefOpen}
        onOpenChange={setIsAddRefOpen}
      />
    </Sheet>
  );
}

function ReferenceImageThumb({
  refData,
  onClick,
}: {
  refData: Doc<"character">["referenceImages"][number];
  onClick: () => void;
}) {
  const image = useQuery(api.image.get, { id: refData.imageId });
  return (
    <div
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-black/40"
      onClick={onClick}
    >
      {image?.url ? (
        <Image
          src={image.url}
          alt={refData.name}
          width={image.width ?? 1024}
          height={image.height ?? 1024}
          className="object-cover transition-transform group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Zap size={16} className="animate-pulse text-white/20" />
        </div>
      )}
    </div>
  );
}

function ImageDetailsModal({
  element,
  refIndex,
  onClose,
}: {
  element: Element;
  refIndex: number | null;
  onClose: () => void;
}) {
  const refData = refIndex !== null ? element.referenceImages[refIndex] : null;
  const image = useQuery(
    api.image.get,
    refData ? { id: refData.imageId } : "skip",
  );

  const { control, handleSubmit, reset, ...form } = useForm<
    z.infer<typeof ReferenceImageSchema>
  >({
    resolver: zodResolver(ReferenceImageSchema),
    defaultValues: {
      name: refData?.name ?? "",
      description: refData?.description ?? "",
    },
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const updateCharacter = useMutation(api.character.update);
  const updateEnvironment = useMutation(api.environment.update);
  const updateItem = useMutation(api.item.update);
  const removeRefCharacter = useMutation(api.character.removeReferenceImage);
  const removeRefEnvironment = useMutation(
    api.environment.removeReferenceImage,
  );
  const removeRefItem = useMutation(api.item.removeReferenceImage);

  useEffect(() => {
    if (refData) {
      reset({
        name: refData.name,
        description: refData.description ?? "",
      });
    }
  }, [refData, reset]);

  if (!refData || refIndex === null) return null;

  const onUpdate = async (data: z.infer<typeof ReferenceImageSchema>) => {
    setIsUpdating(true);
    try {
      const referenceImages = [...element.referenceImages];
      referenceImages[refIndex] = {
        ...refData,
        name: data.name,
        description: data.description,
      };
      if (element.type === "character")
        await updateCharacter({
          referenceImages,
          id: element._id as Id<"character">,
        });
      else if (element.type === "environment")
        await updateEnvironment({
          referenceImages,
          id: element._id as Id<"environment">,
        });
      else
        await updateItem({
          referenceImages,
          id: element._id as Id<"item">,
        });
      toast.success("Reference updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (element.type === "character") {
        await removeRefCharacter({
          id: element._id as Id<"character">,
          imageId: refData.imageId,
        });
      } else if (element.type === "environment") {
        await removeRefEnvironment({
          id: element._id as Id<"environment">,
          imageId: refData.imageId,
        });
      } else {
        await removeRefItem({
          id: element._id as Id<"item">,
          imageId: refData.imageId,
        });
      }
      toast.success("Reference removed");
      onClose();
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <DrawerDialog
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      open={refIndex !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerDialogContent
        showCloseButton={false}
        className="h-max max-h-[80vh] w-full rounded-md p-0 md:h-full md:max-w-[min(1200px,90vw)]"
      >
        <DrawerDialogTitle className="sr-only">
          Reference Details
        </DrawerDialogTitle>
        <DrawerDialogDescription className="sr-only">
          Use this to view and edit the reference image details.
        </DrawerDialogDescription>
        <div className="flex w-full flex-col md:h-[80vh] md:flex-row">
          <div className="bg-muted min-h-[50vw] w-full p-6">
            {image?.url ? (
              <Image
                src={image.url}
                width={image.width ?? 1024}
                height={image.height ?? 1024}
                alt={refData.name}
                className="h-full w-full object-contain"
              />
            ) : (
              image?.status === "generating" && (
                <Skeleton className="h-full w-full bg-[#131313]" />
              )
            )}
          </div>
          <form
            onSubmit={(e) => void handleSubmit(onUpdate)(e)}
            className="flex w-full flex-col gap-6 p-6 md:w-[320px]"
          >
            <div className="space-y-4">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-[10px] font-bold text-white/30 uppercase">
                      Title
                    </FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="border-none bg-white/5"
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-[10px]"
                      />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-[10px] font-bold text-white/30 uppercase">
                      Description
                    </FieldLabel>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="min-h-[100px] border-none bg-white/5"
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-[10px]"
                      />
                    )}
                  </Field>
                )}
              />
            </div>
            <div className="mt-auto space-y-2">
              <Button
                type="submit"
                disabled={isUpdating || !form.formState.isDirty}
                className="w-full bg-[#efcb61] text-black"
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  void handleDelete();
                }}
                className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-500"
              >
                Delete Reference
              </Button>
            </div>
          </form>
        </div>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}

function AddReferenceModal({
  element,
  open,
  onOpenChange,
}: {
  element: Element;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { control, handleSubmit, setValue, reset } = useForm<
    z.infer<typeof AddReferenceSchema>
  >({
    resolver: zodResolver(AddReferenceSchema),
    defaultValues: {
      name: "",
      description: "",
      imageId: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addRefCharacter = useMutation(api.character.addReferenceImages);
  const addRefEnvironment = useMutation(api.environment.addReferenceImages);
  const addRefItem = useMutation(api.item.addReferenceImages);

  const onSubmit = async (data: z.infer<typeof AddReferenceSchema>) => {
    setIsSubmitting(true);
    try {
      const images = [
        {
          imageId: data.imageId as Id<"image">,
          name: data.name,
          description: data.description,
        },
      ];

      if (element.type === "character")
        await addRefCharacter({ id: element._id as Id<"character">, images });
      else if (element.type === "environment")
        await addRefEnvironment({
          id: element._id as Id<"environment">,
          images,
        });
      else await addRefItem({ id: element._id as Id<"item">, images });
      toast.success("Reference added");
      onOpenChange(false);
      reset();
    } catch {
      toast.error("Failed to add reference");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Reference Image</DialogTitle>
          <DialogDescription>
            Add a visual reference to this element.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
          <div className="space-y-4 py-4">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-[10px] font-bold text-white/30 uppercase">
                    Title
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder="Front profile, Weapon detail..."
                    aria-invalid={fieldState.invalid}
                    className="border-none bg-white/5"
                  />
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-[10px]"
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-[10px] font-bold text-white/30 uppercase">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Context for this reference..."
                    aria-invalid={fieldState.invalid}
                    className="border-none bg-white/5"
                  />
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-[10px]"
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="imageId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-[10px] font-bold text-white/30 uppercase">
                    Select Image
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      placeholder="Paste Media ID..."
                      aria-invalid={fieldState.invalid}
                      className="flex-1 border-none bg-white/5"
                    />
                    <UploadedImageSelector
                      projectId={element.projectId}
                      selectedImages={[]}
                      onSelect={(imgs) => {
                        if (imgs[0]) setValue("imageId", imgs[0]._id);
                      }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 border-white/10 bg-white/5"
                      >
                        Upload
                      </Button>
                    </UploadedImageSelector>
                  </div>
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-[10px]"
                    />
                  )}
                </Field>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#efcb61] text-black"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Add Reference"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
