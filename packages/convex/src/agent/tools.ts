import { tool } from "ai";
import { z } from "zod";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { RunMutationCtx, RunQueryCtx, sleep } from "../utils";

export const DELAY = 10000;

// --- Image Tools ---

export const getImagesByIdTool = (ctx: RunQueryCtx) =>
  tool({
    description: "Get one or more images by their IDs",
    inputSchema: z.object({
      ids: z.array(z.string().describe("The Convex ID of the image")),
    }),
    execute: async ({ ids }) => {
      await sleep(DELAY);
      const results = await Promise.all(
        ids.map((id) =>
          ctx.runQuery(internal.agent.fn.getImageById, {
            id: id as Id<"image">,
          }),
        ),
      );

      return results.filter((r) => r !== null);
    },
  });

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
) =>
  tool({
    description:
      "Generate one or more new images based on prompts and project context",
    inputSchema: z.object({
      images: z.array(
        z.object({
          prompt: z.string().describe("The prompt to generate the image"),
          width: z.number().optional().describe("Image width"),
          height: z.number().optional().describe("Image height"),
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
          }),
        ),
      );

      return result;
    },
  });

// --- Audio Tools ---

export const getAudiosByIdTool = (ctx: RunQueryCtx) =>
  tool({
    description: "Get one or more audio assets by their IDs",
    inputSchema: z.object({
      ids: z.array(z.string().describe("The Convex ID of the audio asset")),
    }),
    execute: async ({ ids }) => {
      await sleep(DELAY);
      const results = await Promise.all(
        ids.map((id) =>
          ctx.runQuery(internal.agent.fn.getAudioById, {
            id: id as Id<"audio">,
          }),
        ),
      );

      return results.filter((r) => r !== null);
    },
  });

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

export const getCharactersByIdTool = (ctx: RunQueryCtx) =>
  tool({
    description: "Get one or more characters' details by their IDs",
    inputSchema: z.object({
      ids: z.array(z.string().describe("The Convex ID of the character")),
    }),
    execute: async ({ ids }) => {
      await sleep(DELAY);
      const results = await Promise.all(
        ids.map((id) =>
          ctx.runQuery(internal.agent.fn.getCharacterById, {
            id: id as Id<"character">,
          }),
        ),
      );
      return results.filter((r) => r !== null);
    },
  });

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

export const updateCharactersTool = (ctx: RunMutationCtx) =>
  tool({
    description: "Update multiple existing characters' fields",
    inputSchema: z.object({
      characters: z.array(
        z.object({
          id: z.string().describe("The Convex ID of the character to update"),
          name: z.string().optional().describe("The new name"),
          description: z.string().optional().describe("The new description"),
          personality: z.string().optional().describe("The new personality"),
          appearance: z.string().optional().describe("The new appearance"),
          age: z.string().optional().describe("The new age"),
        }),
      ),
    }),
    execute: async ({ characters }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        characters.map((character) =>
          ctx.runMutation(internal.agent.fn.updateCharacter, {
            ...character,
            id: character.id as Id<"character">,
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

export const getEnvironmentsByIdTool = (ctx: RunQueryCtx) =>
  tool({
    description: "Get one or more environments' details by their IDs",
    inputSchema: z.object({
      ids: z.array(z.string().describe("The Convex ID of the environment")),
    }),
    execute: async ({ ids }) => {
      await sleep(DELAY);
      const results = await Promise.all(
        ids.map((id) =>
          ctx.runQuery(internal.agent.fn.getEnvironmentById, {
            id: id as Id<"environment">,
          }),
        ),
      );
      return results.filter((r) => r !== null);
    },
  });

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

export const updateEnvironmentsTool = (ctx: RunMutationCtx) =>
  tool({
    description: "Update multiple existing environments' fields",
    inputSchema: z.object({
      environments: z.array(
        z.object({
          id: z.string().describe("The Convex ID of the environment to update"),
          name: z.string().optional().describe("The new name"),
          description: z.string().optional().describe("The new description"),
        }),
      ),
    }),
    execute: async ({ environments }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        environments.map((env) =>
          ctx.runMutation(internal.agent.fn.updateEnvironment, {
            ...env,
            id: env.id as Id<"environment">,
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

// --- Scene Tools ---

export const getScenesByIdTool = (ctx: RunQueryCtx) =>
  tool({
    description: "Get one or more scenes' details by their IDs",
    inputSchema: z.object({
      ids: z.array(z.string().describe("The Convex ID of the scene")),
    }),
    execute: async ({ ids }) => {
      await sleep(DELAY);
      const results = await Promise.all(
        ids.map((id) =>
          ctx.runQuery(internal.agent.fn.getSceneById, {
            id: id as Id<"scene">,
          }),
        ),
      );
      return results.filter((r) => r !== null);
    },
  });

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

export const updateScenesTool = (ctx: RunMutationCtx) =>
  tool({
    description: "Update multiple existing scenes' fields",
    inputSchema: z.object({
      scenes: z.array(
        z.object({
          id: z.string().describe("The Convex ID of the scene to update"),
          order: z.number().optional().describe("The new sequential order"),
          title: z.string().optional().describe("The new title"),
        }),
      ),
    }),
    execute: async ({ scenes }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        scenes.map((scene) =>
          ctx.runMutation(internal.agent.fn.updateScene, {
            ...scene,
            id: scene.id as Id<"scene">,
          }),
        ),
      );
      return result;
    },
  });

// --- Shot Tools ---

export const getShotsByIdTool = (ctx: RunQueryCtx) =>
  tool({
    description: "Get one or more shots' details by their IDs",
    inputSchema: z.object({
      ids: z.array(z.string().describe("The Convex ID of the shot")),
    }),
    execute: async ({ ids }) => {
      await sleep(DELAY);
      const results = await Promise.all(
        ids.map((id) =>
          ctx.runQuery(internal.agent.fn.getShotById, { id: id as Id<"shot"> }),
        ),
      );
      return results.filter((r) => r !== null);
    },
  });

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

export const updateShotsTool = (ctx: RunMutationCtx) =>
  tool({
    description: "Update multiple existing shots' fields",
    inputSchema: z.object({
      shots: z.array(
        z.object({
          id: z.string().describe("The Convex ID of the shot to update"),
          title: z.string().optional().describe("The new title"),
          order: z.number().optional().describe("The new sequential order"),
          duration: z.number().optional().describe("The new duration"),
          selectedStartFrame: z
            .string()
            .optional()
            .describe("ID of the selected start frame image"),
          selectedEndFrame: z
            .string()
            .optional()
            .describe("ID of the selected end frame image"),
          selectedVideoClip: z
            .string()
            .optional()
            .describe("ID of the selected video clip"),
        }),
      ),
    }),
    execute: async ({ shots }) => {
      await sleep(DELAY);
      const result = await Promise.all(
        shots.map((shot) =>
          ctx.runMutation(internal.agent.fn.updateShot, {
            ...shot,
            id: shot.id as Id<"shot">,
            selectedStartFrame: shot.selectedStartFrame as
              | Id<"image">
              | undefined,
            selectedEndFrame: shot.selectedEndFrame as Id<"image"> | undefined,
            selectedVideoClip: shot.selectedVideoClip as
              | Id<"video">
              | undefined,
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

export const getVideosByIdTool = (ctx: RunQueryCtx) =>
  tool({
    description: "Get one or more videos' details by their IDs",
    inputSchema: z.object({
      ids: z.array(z.string().describe("The Convex ID of the video")),
    }),
    execute: async ({ ids }) => {
      await sleep(DELAY);
      const results = await Promise.all(
        ids.map((id) =>
          ctx.runQuery(internal.agent.fn.getVideoById, {
            id: id as Id<"video">,
          }),
        ),
      );
      return results.filter((r) => r !== null);
    },
  });

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
) =>
  tool({
    description: "Generate one or more new video clips based on prompts",
    inputSchema: z.object({
      videos: z.array(
        z.object({
          prompt: z.string().describe("The prompt to generate the video"),
          seed: z.number().optional().describe("Random seed for generation"),
          width: z.number().optional().describe("Video width"),
          height: z.number().optional().describe("Video height"),
          duration: z.number().optional().describe("Intended duration"),
          frameRate: z.enum(["24", "30", "60"]).describe("Video frame rate"),
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
          }),
        ),
      );
      return result;
    },
  });

// --- Voice Tools ---

export const getVoicesByIdTool = (ctx: RunQueryCtx) =>
  tool({
    description: "Get one or more voices' details by their IDs",
    inputSchema: z.object({
      ids: z.array(z.string().describe("The Convex ID of the voice")),
    }),
    execute: async ({ ids }) => {
      await sleep(DELAY);
      const results = await Promise.all(
        ids.map((id) =>
          ctx.runQuery(internal.agent.fn.getVoiceById, {
            id: id as Id<"voice">,
          }),
        ),
      );
      return results.filter((r) => r !== null);
    },
  });

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
