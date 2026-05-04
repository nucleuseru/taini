"use server";

import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { FunctionArgs } from "convex/server";

export type ElementType = "character" | "environment" | "item";

export type CreateElementOptions =
  | ({ type: "environment" } & FunctionArgs<typeof api.environment.create>)
  | ({ type: "character" } & FunctionArgs<typeof api.character.create>)
  | ({ type: "item" } & FunctionArgs<typeof api.item.create>);

export type UpdateElementOptions =
  | ({ type: "environment" } & FunctionArgs<typeof api.environment.update>)
  | ({ type: "character" } & FunctionArgs<typeof api.character.update>)
  | ({ type: "item" } & FunctionArgs<typeof api.item.update>);

export type RemoveElementOptions =
  | { type: "environment"; id: Id<"environment"> }
  | { type: "character"; id: Id<"character"> }
  | { type: "item"; id: Id<"item"> };

export type RemoveReferenceImageOptions =
  | { type: "character"; id: Id<"character">; imageId: Id<"image"> }
  | { type: "environment"; id: Id<"environment">; imageId: Id<"image"> }
  | { type: "item"; id: Id<"item">; imageId: Id<"image"> };

export type GenerateElementReferenceImageOptions =
  | {
      type: "character";
      id: Id<"character">;
      projectId: Id<"project">;
      prompt: string;
      name: string;
      description?: string;
    }
  | {
      type: "environment";
      id: Id<"environment">;
      projectId: Id<"project">;
      prompt: string;
      name: string;
      description?: string;
    }
  | {
      type: "item";
      id: Id<"item">;
      projectId: Id<"project">;
      prompt: string;
      name: string;
      description?: string;
    };

export type UploadElementReferenceImageOptions =
  | {
      type: "character";
      id: Id<"character">;
      projectId: Id<"project">;
      storageId: Id<"_storage">;
      name: string;
      description?: string;
    }
  | {
      type: "environment";
      id: Id<"environment">;
      projectId: Id<"project">;
      storageId: Id<"_storage">;
      name: string;
      description?: string;
    }
  | {
      type: "item";
      id: Id<"item">;
      projectId: Id<"project">;
      storageId: Id<"_storage">;
      name: string;
      description?: string;
    };

export type RegenerateReferenceImageOptions =
  | {
      type: "character";
      id: Id<"character">;
      projectId: Id<"project">;
      oldImageId: Id<"image">;
      prompt: string;
      name: string;
      description?: string;
    }
  | {
      type: "environment";
      id: Id<"environment">;
      projectId: Id<"project">;
      oldImageId: Id<"image">;
      prompt: string;
      name: string;
      description?: string;
    }
  | {
      type: "item";
      id: Id<"item">;
      projectId: Id<"project">;
      oldImageId: Id<"image">;
      prompt: string;
      name: string;
      description?: string;
    };

export async function createElement(options: CreateElementOptions) {
  try {
    let result;

    if (options.type === "character") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _type, ...data } = options;
      result = await fetchAuthMutation(api.character.create, data);
    } else if (options.type === "environment") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _type, ...data } = options;
      result = await fetchAuthMutation(api.environment.create, data);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _type, ...data } = options;
      result = await fetchAuthMutation(api.item.create, data);
    }

    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: `Failed to create ${options.type}` };
  }
}

export async function updateElement(options: UpdateElementOptions) {
  try {
    if (options.type === "character") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _type, ...data } = options;
      await fetchAuthMutation(api.character.update, data);
    } else if (options.type === "environment") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _type, ...data } = options;
      await fetchAuthMutation(api.environment.update, data);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _type, ...data } = options;
      await fetchAuthMutation(api.item.update, data);
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: `Failed to update ${options.type}` };
  }
}

export async function removeElement(options: RemoveElementOptions) {
  try {
    if (options.type === "character") {
      await fetchAuthMutation(api.character.remove, { id: options.id });
    } else if (options.type === "environment") {
      await fetchAuthMutation(api.environment.remove, { id: options.id });
    } else {
      await fetchAuthMutation(api.item.remove, { id: options.id });
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: `Failed to remove ${options.type}` };
  }
}

export async function generateElementReferenceImage(
  options: GenerateElementReferenceImageOptions,
) {
  try {
    const { imageId } = await fetchAuthMutation(api.image.generate, {
      projectId: options.projectId,
      prompt: options.prompt,
      illustration: true,
    });

    const refData = {
      imageId,
      name: options.name,
      description: options.description,
    };

    if (options.type === "character") {
      await fetchAuthMutation(api.character.addReferenceImages, {
        id: options.id,
        images: [refData],
      });
    } else if (options.type === "environment") {
      await fetchAuthMutation(api.environment.addReferenceImages, {
        id: options.id,
        images: [refData],
      });
    } else {
      await fetchAuthMutation(api.item.addReferenceImages, {
        id: options.id,
        images: [refData],
      });
    }

    return { success: true, imageId };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate reference image" };
  }
}

export async function uploadElementReferenceImage(
  options: UploadElementReferenceImageOptions,
) {
  try {
    const { imageId } = await fetchAuthMutation(api.image.upload, {
      projectId: options.projectId,
      storageId: options.storageId,
    });

    const refData = {
      imageId,
      name: options.name,
      description: options.description,
    };

    if (options.type === "character") {
      await fetchAuthMutation(api.character.addReferenceImages, {
        id: options.id,
        images: [refData],
      });
    } else if (options.type === "environment") {
      await fetchAuthMutation(api.environment.addReferenceImages, {
        id: options.id,
        images: [refData],
      });
    } else {
      await fetchAuthMutation(api.item.addReferenceImages, {
        id: options.id,
        images: [refData],
      });
    }

    return { success: true, imageId };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to upload reference image" };
  }
}

export async function triggerElementInference(imageIds: Id<"image">[]) {
  try {
    await Promise.all(
      imageIds.map((id) =>
        fetchAuthMutation(api.image.triggerInference, { id }),
      ),
    );
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to trigger inference" };
  }
}

export async function regenerateReferenceImage(
  options: RegenerateReferenceImageOptions,
) {
  try {
    const { imageId: newImageId } = await fetchAuthMutation(
      api.image.generate,
      {
        projectId: options.projectId,
        prompt: options.prompt,
        illustration: true,
      },
    );

    const refData = {
      name: options.name,
      description: options.description,
      imageId: newImageId,
    };

    if (options.type === "character") {
      await fetchAuthMutation(api.character.addReferenceImages, {
        id: options.id,
        images: [refData],
      });
      await fetchAuthMutation(api.image.triggerInference, { id: newImageId });
      await fetchAuthMutation(api.character.removeReferenceImage, {
        id: options.id,
        imageId: options.oldImageId,
      });
    } else if (options.type === "environment") {
      await fetchAuthMutation(api.environment.addReferenceImages, {
        id: options.id,
        images: [refData],
      });
      await fetchAuthMutation(api.image.triggerInference, { id: newImageId });
      await fetchAuthMutation(api.environment.removeReferenceImage, {
        id: options.id,
        imageId: options.oldImageId,
      });
    } else {
      await fetchAuthMutation(api.item.addReferenceImages, {
        id: options.id,
        images: [refData],
      });
      await fetchAuthMutation(api.image.triggerInference, { id: newImageId });
      await fetchAuthMutation(api.item.removeReferenceImage, {
        id: options.id,
        imageId: options.oldImageId,
      });
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to regenerate reference image" };
  }
}

export async function removeReferenceImage(
  options: RemoveReferenceImageOptions,
) {
  try {
    if (options.type === "character") {
      await fetchAuthMutation(api.character.removeReferenceImage, {
        id: options.id,
        imageId: options.imageId,
      });
    } else if (options.type === "environment") {
      await fetchAuthMutation(api.environment.removeReferenceImage, {
        id: options.id,
        imageId: options.imageId,
      });
    } else {
      await fetchAuthMutation(api.item.removeReferenceImage, {
        id: options.id,
        imageId: options.imageId,
      });
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to remove reference image" };
  }
}

export async function getUploadUrl() {
  return await fetchAuthMutation(api.upload.generateUrl, {});
}
