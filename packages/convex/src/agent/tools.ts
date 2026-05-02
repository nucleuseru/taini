import { tool } from "ai";
import { z } from "zod";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { RunMutationCtx, RunQueryCtx, sleep } from "../utils";

export const DELAY = 10000;

// --- Image Tools ---

export const listImagesTool = (ctx: RunQueryCtx, projectId: Id<"project">) =>
  tool({
    description: "List images in a project",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .describe("Number of items to return (default 100) (max 500)"),
    }),
    execute: async (args) => {
      await sleep(DELAY);
      const result = await ctx.runQuery(internal.agent.fn.listImages, {
        projectId,
        paginationOpts: { numItems: args.limit ?? 100, cursor: null },
      });

      return result.page;
    },
  });

export const generateImagesTool = (
  ctx: RunMutationCtx,
  projectId: Id<"project">,
  storyboardId: Id<"storyboard">,
) =>
  tool({
    description:
      "Generate one or more new images based on prompts and project context",
    inputSchema: z.object({
      images: z.array(
        z.object({
          prompt: z.string().describe("The prompt to generate the image"),
          illustration: z
            .boolean()
            .describe("Whether this is a character or an environment"),
          referenceImages: z
            .array(z.string())
            .optional()
            .describe("IDs of reference images to use for generation"),
        }),
      ),
    }),
    execute: async ({ images }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        images.map((image) =>
          ctx.runMutation(internal.agent.fn.generateImage, {
            ...image,
            referenceImages: image.referenceImages as Id<"image">[] | undefined,
            projectId,
            storyboardId,
          }),
        ),
      );

      return result;
    },
  });

// --- Audio Tools ---

export const listAudiosTool = (ctx: RunQueryCtx, projectId: Id<"project">) =>
  tool({
    description: "List audio assets in a project",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .describe("Number of items to return (default 100) (max 500)"),
    }),
    execute: async (args) => {
      await sleep(DELAY);
      const result = await ctx.runQuery(internal.agent.fn.listAudios, {
        projectId,
        paginationOpts: { numItems: args.limit ?? 100, cursor: null },
      });
      return result.page;
    },
  });

export const generateAudiosTool = (
  ctx: RunMutationCtx,
  projectId: Id<"project">,
) =>
  tool({
    description:
      "Generate one or more new audio assets (multi speaker audio or voice over)",
    inputSchema: z.object({
      audios: z.array(
        z.object({
          title: z.string().describe("Title for the audio asset"),
          referenceVoice: z
            .string()
            .describe("ID of the voice to use for Text-to-Speech"),
          text: z.string().describe("The text used to generate the audio"),
        }),
      ),
    }),
    execute: async ({ audios }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        audios.map((audio) =>
          ctx.runMutation(internal.agent.fn.generateAudio, {
            ...audio,
            projectId,
            referenceVoice: audio.referenceVoice as Id<"voice">,
          }),
        ),
      );
      return result;
    },
  });

// --- Character Tools ---

export const listCharactersTool = (
  ctx: RunQueryCtx,
  projectId: Id<"project">,
) =>
  tool({
    description: "List all characters in a project",
    inputSchema: z.object({}),
    execute: async () => {
      await sleep(DELAY);
      const result = await ctx.runQuery(internal.agent.fn.listCharacters, {
        projectId,
      });
      return result;
    },
  });

export const createCharactersTool = (
  ctx: RunMutationCtx,
  projectId: Id<"project">,
) =>
  tool({
    description: "Create one or more new characters in a project",
    inputSchema: z.object({
      characters: z.array(
        z.object({
          name: z.string().describe("The name of the character"),
          description: z
            .string()
            .describe("General description of the character"),
          personality: z
            .string()
            .describe("Narrative and behavioral personality traits"),
          appearance: z.string().describe("Visual appearance details"),
          age: z.string().describe("Age or age range of the character"),
        }),
      ),
    }),
    execute: async ({ characters }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        characters.map((character) =>
          ctx.runMutation(internal.agent.fn.createCharacter, {
            ...character,
            projectId,
          }),
        ),
      );
      return result;
    },
  });

export const addCharacterReferenceImagesTool = (ctx: RunMutationCtx) =>
  tool({
    description: "Add multiple reference images to one or more characters",
    inputSchema: z.object({
      references: z.array(
        z.object({
          characterId: z.string().describe("The Convex ID of the character"),
          images: z.array(
            z.object({
              name: z.string().describe("Label for the reference image"),
              description: z
                .string()
                .optional()
                .describe("Description of what this image shows"),
              imageId: z.string().describe("ID of the image asset"),
            }),
          ),
        }),
      ),
    }),
    execute: async ({ references }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        references.map((ref) =>
          ctx.runMutation(internal.agent.fn.addCharacterReferenceImages, {
            id: ref.characterId as Id<"character">,
            images: ref.images.map((img) => ({
              ...img,
              imageId: img.imageId as Id<"image">,
            })),
          }),
        ),
      );
      return result;
    },
  });

// --- Environment Tools ---

export const listEnvironmentsTool = (
  ctx: RunQueryCtx,
  projectId: Id<"project">,
) =>
  tool({
    description: "List all environments in a project",
    inputSchema: z.object({}),
    execute: async () => {
      await sleep(DELAY);
      const result = await ctx.runQuery(internal.agent.fn.listEnvironments, {
        projectId,
      });
      return result;
    },
  });

export const createEnvironmentsTool = (
  ctx: RunMutationCtx,
  projectId: Id<"project">,
) =>
  tool({
    description: "Create one or more new environments in a project",
    inputSchema: z.object({
      environments: z.array(
        z.object({
          name: z.string().describe("The name of the environment"),
          description: z
            .string()
            .describe("General description of the environment"),
        }),
      ),
    }),
    execute: async ({ environments }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        environments.map((env) =>
          ctx.runMutation(internal.agent.fn.createEnvironment, {
            ...env,
            projectId,
          }),
        ),
      );
      return result;
    },
  });

export const addEnvironmentReferenceImagesTool = (ctx: RunMutationCtx) =>
  tool({
    description: "Add multiple reference images to one or more environments",
    inputSchema: z.object({
      references: z.array(
        z.object({
          environmentId: z
            .string()
            .describe("The Convex ID of the environment"),
          images: z.array(
            z.object({
              name: z.string().describe("Label for the reference image"),
              description: z
                .string()
                .optional()
                .describe("Description of what this image shows"),
              imageId: z.string().describe("ID of the image asset"),
            }),
          ),
        }),
      ),
    }),
    execute: async ({ references }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        references.map((ref) =>
          ctx.runMutation(internal.agent.fn.addEnvironmentReferenceImages, {
            id: ref.environmentId as Id<"environment">,
            images: ref.images.map((img) => ({
              ...img,
              imageId: img.imageId as Id<"image">,
            })),
          }),
        ),
      );
      return result;
    },
  });

// --- Item Tools ---

export const listItemsTool = (ctx: RunQueryCtx, projectId: Id<"project">) =>
  tool({
    description: "List all items in a project",
    inputSchema: z.object({}),
    execute: async () => {
      await sleep(DELAY);
      const result = await ctx.runQuery(internal.agent.fn.listItems, {
        projectId,
      });
      return result;
    },
  });

export const createItemsTool = (
  ctx: RunMutationCtx,
  projectId: Id<"project">,
) =>
  tool({
    description: "Create one or more new items (props) in a project",
    inputSchema: z.object({
      items: z.array(
        z.object({
          name: z.string().describe("The name of the item"),
          description: z.string().describe("General description of the item"),
        }),
      ),
    }),
    execute: async ({ items }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        items.map((item) =>
          ctx.runMutation(internal.agent.fn.createItem, {
            ...item,
            projectId,
          }),
        ),
      );
      return result;
    },
  });

export const addItemReferenceImagesTool = (ctx: RunMutationCtx) =>
  tool({
    description: "Add multiple reference images to one or more items",
    inputSchema: z.object({
      references: z.array(
        z.object({
          itemId: z.string().describe("The Convex ID of the item"),
          images: z.array(
            z.object({
              name: z.string().describe("Label for the reference image"),
              description: z
                .string()
                .optional()
                .describe("Description of what this image shows"),
              imageId: z.string().describe("ID of the image asset"),
            }),
          ),
        }),
      ),
    }),
    execute: async ({ references }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        references.map((ref) =>
          ctx.runMutation(internal.agent.fn.addItemReferenceImages, {
            id: ref.itemId as Id<"item">,
            images: ref.images.map((img) => ({
              ...img,
              imageId: img.imageId as Id<"image">,
            })),
          }),
        ),
      );
      return result;
    },
  });

// --- Scene Tools ---

export const listScenesTool = (
  ctx: RunQueryCtx,
  storyboardId: Id<"storyboard">,
) =>
  tool({
    description: "List all scenes in a storyboard",
    inputSchema: z.object({}),
    execute: async () => {
      await sleep(DELAY);
      const result = await ctx.runQuery(internal.agent.fn.listScenes, {
        storyboardId,
      });
      return result;
    },
  });

export const createScenesTool = (
  ctx: RunMutationCtx,
  storyboardId: Id<"storyboard">,
) =>
  tool({
    description: "Create one or more new scenes within a storyboard",
    inputSchema: z.object({
      scenes: z.array(
        z.object({
          order: z.number().describe("The sequential order of the scene"),
          title: z.string().describe("The title or slug for the scene"),
          description: z.string().describe("The description of the scene"),
        }),
      ),
    }),
    execute: async ({ scenes }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        scenes.map((scene) =>
          ctx.runMutation(internal.agent.fn.createScene, {
            ...scene,
            storyboardId,
          }),
        ),
      );
      return result;
    },
  });

// --- Shot Tools ---

export const listShotsTool = (ctx: RunQueryCtx) =>
  tool({
    description: "List all shots in a scene",
    inputSchema: z.object({
      sceneId: z.string().describe("The Convex ID of the scene"),
    }),
    execute: async (args) => {
      await sleep(DELAY);
      const result = await ctx.runQuery(internal.agent.fn.listShots, {
        sceneId: args.sceneId as Id<"scene">,
      });
      return result;
    },
  });

export const createShotsTool = (ctx: RunMutationCtx) =>
  tool({
    description: "Create one or more new shots within a scene",
    inputSchema: z.object({
      shots: z.array(
        z.object({
          sceneId: z.string().describe("The Convex ID of the scene"),
          title: z.string().describe("The title or description of the shot"),
          order: z.number().describe("The sequential order of the shot"),
          duration: z.number().describe("Intended duration in seconds"),
          description: z.string().describe("Description of the shot"),
        }),
      ),
    }),
    execute: async ({ shots }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        shots.map((shot) =>
          ctx.runMutation(internal.agent.fn.createShot, {
            ...shot,
            sceneId: shot.sceneId as Id<"scene">,
          }),
        ),
      );
      return result;
    },
  });

export const addShotStartFramesTool = (ctx: RunMutationCtx) =>
  tool({
    description:
      "Add multiple start frame variants (images) to one or more shots",
    inputSchema: z.object({
      shots: z.array(
        z.object({
          shotId: z.string().describe("The Convex ID of the shot"),
          images: z.array(z.string()).describe("IDs of the image assets"),
        }),
      ),
    }),
    execute: async ({ shots }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        shots.map((shot) =>
          ctx.runMutation(internal.agent.fn.addShotStartFrames, {
            id: shot.shotId as Id<"shot">,
            imageIds: shot.images as Id<"image">[],
          }),
        ),
      );
      return result;
    },
  });

export const addShotEndFramesTool = (ctx: RunMutationCtx) =>
  tool({
    description:
      "Add multiple end frame variants (images) to one or more shots",
    inputSchema: z.object({
      shots: z.array(
        z.object({
          shotId: z.string().describe("The Convex ID of the shot"),
          images: z.array(z.string()).describe("IDs of the image assets"),
        }),
      ),
    }),
    execute: async ({ shots }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        shots.map((shot) =>
          ctx.runMutation(internal.agent.fn.addShotEndFrames, {
            id: shot.shotId as Id<"shot">,
            imageIds: shot.images as Id<"image">[],
          }),
        ),
      );
      return result;
    },
  });

export const addShotVideoClipsTool = (ctx: RunMutationCtx) =>
  tool({
    description: "Add multiple video clip variants to one or more shots",
    inputSchema: z.object({
      shots: z.array(
        z.object({
          shotId: z.string().describe("The Convex ID of the shot"),
          videos: z.array(z.string()).describe("IDs of the video assets"),
        }),
      ),
    }),
    execute: async ({ shots }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        shots.map((shot) =>
          ctx.runMutation(internal.agent.fn.addShotVideoClips, {
            id: shot.shotId as Id<"shot">,
            videoIds: shot.videos as Id<"video">[],
          }),
        ),
      );
      return result;
    },
  });

// --- Video Tools ---

export const listVideosTool = (ctx: RunQueryCtx, projectId: Id<"project">) =>
  tool({
    description: "List all videos in a project",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .describe("Number of items to return (default 100) (max 500)"),
    }),
    execute: async (args) => {
      await sleep(DELAY);
      const result = await ctx.runQuery(internal.agent.fn.listVideos, {
        projectId,
        paginationOpts: { numItems: args.limit ?? 100, cursor: null },
      });
      return result.page;
    },
  });

export const generateVideosTool = (
  ctx: RunMutationCtx,
  projectId: Id<"project">,
  storyboardId: Id<"storyboard">,
) =>
  tool({
    description: "Generate one or more new video clips based on prompts",
    inputSchema: z.object({
      videos: z.array(
        z.object({
          prompt: z.string().describe("The prompt to generate the video"),
          seed: z.number().optional().describe("Random seed for generation"),
          duration: z.number().optional().describe("Intended duration"),
          startFrame: z
            .string()
            .optional()
            .describe("ID of an image asset to use as a starting frame"),
          endFrame: z
            .string()
            .optional()
            .describe("ID of an image asset to use as an ending frame"),
          negativePrompt: z
            .string()
            .optional()
            .describe("Negative prompt for generation"),
        }),
      ),
    }),
    execute: async ({ videos }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        videos.map((video) =>
          ctx.runMutation(internal.agent.fn.generateVideo, {
            ...video,
            startFrame: video.startFrame as Id<"image"> | undefined,
            endFrame: video.endFrame as Id<"image"> | undefined,
            projectId,
            storyboardId,
          }),
        ),
      );
      return result;
    },
  });

// --- Voice Tools ---

export const listVoicesTool = (ctx: RunQueryCtx, projectId: Id<"project">) =>
  tool({
    description: "List all voices in a project",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .describe("Number of items to return (default 100) (max 500)"),
    }),
    execute: async (args) => {
      await sleep(DELAY);
      const result = await ctx.runQuery(internal.agent.fn.listVoices, {
        projectId,
        paginationOpts: { numItems: args.limit ?? 100, cursor: null },
      });
      return result.page;
    },
  });
