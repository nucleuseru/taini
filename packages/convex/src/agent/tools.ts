import { tool } from "ai";
import { convexToZod, zid } from "convex-helpers/server/zod4";
import { z } from "zod";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { ActionCtx } from "../_generated/server";
import * as Audio from "../audio";
import * as Character from "../character";
import * as Environment from "../environment";
import * as Image from "../image";
import * as Scene from "../scene";
import * as Shot from "../shot";
import * as Video from "../video";

// --- Image Tools ---

export const getImagesByIdTool = (ctx: ActionCtx) =>
  tool({
    description: "Get one or more images by their IDs",
    inputSchema: z.object({ ids: z.array(zid("image")) }),
    execute: async ({ ids }) => {
      const results = await Promise.all(
        ids.map((id) => ctx.runQuery(internal.agent.fn.getImageById, { id })),
      );
      return results.filter((r) => r !== null);
    },
  });

export const listImagesTool = (ctx: ActionCtx, projectId: Id<"project">) =>
  tool({
    description: "List images in a project",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .describe("Number of items to return (default 100) (max 500)"),
    }),
    execute: async (args) => {
      const result = await ctx.runQuery(internal.agent.fn.listImages, {
        projectId,
        paginationOpts: { numItems: args.limit ?? 100, cursor: null },
      });
      return result.page;
    },
  });

export const generateImagesTool = (ctx: ActionCtx, projectId: Id<"project">) =>
  tool({
    description:
      "Generate one or more new images based on prompts and project context",
    inputSchema: z.object({
      images: z.array(
        convexToZod(Image.GenerateImageArgsValidator.omit("projectId")),
      ),
    }),
    execute: async ({ images }) => {
      return Promise.all(
        images.map((image) =>
          ctx.runMutation(internal.agent.fn.generateImage, {
            ...image,
            projectId,
          }),
        ),
      );
    },
  });

// --- Audio Tools ---

export const getAudiosByIdTool = (ctx: ActionCtx) =>
  tool({
    description: "Get one or more audio assets by their IDs",
    inputSchema: z.object({ ids: z.array(zid("audio")) }),
    execute: async ({ ids }) => {
      const results = await Promise.all(
        ids.map((id) => ctx.runQuery(internal.agent.fn.getAudioById, { id })),
      );
      return results.filter((r) => r !== null);
    },
  });

export const listAudiosTool = (ctx: ActionCtx, projectId: Id<"project">) =>
  tool({
    description: "List audio assets in a project",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .describe("Number of items to return (default 100) (max 500)"),
    }),
    execute: async (args) => {
      const result = await ctx.runQuery(internal.agent.fn.listAudios, {
        projectId,
        paginationOpts: { numItems: args.limit ?? 100, cursor: null },
      });
      return result.page;
    },
  });

export const generateAudiosTool = (ctx: ActionCtx, projectId: Id<"project">) =>
  tool({
    description:
      "Generate one or more new audio assets (multi speaker audio or voice over)",
    inputSchema: z.object({
      audios: z.array(
        convexToZod(Audio.GenerateAudioArgsValidator.omit("projectId")),
      ),
    }),
    execute: async ({ audios }) => {
      return Promise.all(
        audios.map((audio) =>
          ctx.runMutation(internal.agent.fn.generateAudio, {
            ...audio,
            projectId,
          }),
        ),
      );
    },
  });

// --- Character Tools ---

export const getCharactersByIdTool = (ctx: ActionCtx) =>
  tool({
    description: "Get one or more characters' details by their IDs",
    inputSchema: z.object({ ids: z.array(zid("character")) }),
    execute: async ({ ids }) => {
      const results = await Promise.all(
        ids.map((id) =>
          ctx.runQuery(internal.agent.fn.getCharacterById, { id }),
        ),
      );
      return results.filter((r) => r !== null);
    },
  });

export const listCharactersTool = (ctx: ActionCtx, projectId: Id<"project">) =>
  tool({
    description: "List all characters in a project",
    inputSchema: z.object({}),
    execute: () =>
      ctx.runQuery(internal.agent.fn.listCharacters, { projectId }),
  });

export const createCharactersTool = (
  ctx: ActionCtx,
  projectId: Id<"project">,
) =>
  tool({
    description: "Create one or more new characters in a project",
    inputSchema: z.object({
      characters: z.array(
        convexToZod(Character.CreateCharacterArgsValidator.omit("projectId")),
      ),
    }),
    execute: async ({ characters }) => {
      return Promise.all(
        characters.map((character) =>
          ctx.runMutation(internal.agent.fn.createCharacter, {
            ...character,
            projectId,
          }),
        ),
      );
    },
  });

export const updateCharactersTool = (ctx: ActionCtx) =>
  tool({
    description: "Update multiple existing characters' fields",
    inputSchema: z.object({
      characters: z.array(convexToZod(Character.UpdateCharacterArgsValidator)),
    }),
    execute: async ({ characters }) => {
      return Promise.all(
        characters.map((character) =>
          ctx.runMutation(internal.agent.fn.updateCharacter, character),
        ),
      );
    },
  });

export const addCharacterReferenceImagesTool = (ctx: ActionCtx) =>
  tool({
    description: "Add multiple reference images to one or more characters",
    inputSchema: z.object({
      references: z.array(
        convexToZod(Character.AddCharacterReferenceImagesArgsValidator),
      ),
    }),
    execute: async ({ references }) => {
      return Promise.all(
        references.map((ref) =>
          ctx.runMutation(internal.agent.fn.addCharacterReferenceImages, ref),
        ),
      );
    },
  });

// --- Environment Tools ---

export const getEnvironmentsByIdTool = (ctx: ActionCtx) =>
  tool({
    description: "Get one or more environments' details by their IDs",
    inputSchema: z.object({ ids: z.array(zid("environment")) }),
    execute: async ({ ids }) => {
      const results = await Promise.all(
        ids.map((id) =>
          ctx.runQuery(internal.agent.fn.getEnvironmentById, { id }),
        ),
      );
      return results.filter((r) => r !== null);
    },
  });

export const listEnvironmentsTool = (
  ctx: ActionCtx,
  projectId: Id<"project">,
) =>
  tool({
    description: "List all environments in a project",
    inputSchema: z.object({}),
    execute: () =>
      ctx.runQuery(internal.agent.fn.listEnvironments, { projectId }),
  });

export const createEnvironmentsTool = (
  ctx: ActionCtx,
  projectId: Id<"project">,
) =>
  tool({
    description: "Create one or more new environments in a project",
    inputSchema: z.object({
      environments: z.array(
        convexToZod(
          Environment.CreateEnvironmentArgsValidator.omit("projectId"),
        ),
      ),
    }),
    execute: async ({ environments }) => {
      return Promise.all(
        environments.map((env) =>
          ctx.runMutation(internal.agent.fn.createEnvironment, {
            ...env,
            projectId,
          }),
        ),
      );
    },
  });

export const updateEnvironmentsTool = (ctx: ActionCtx) =>
  tool({
    description: "Update multiple existing environments' fields",
    inputSchema: z.object({
      environments: z.array(
        convexToZod(Environment.UpdateEnvironmentArgsValidator),
      ),
    }),
    execute: async ({ environments }) => {
      return Promise.all(
        environments.map((env) =>
          ctx.runMutation(internal.agent.fn.updateEnvironment, env),
        ),
      );
    },
  });

export const addEnvironmentReferenceImagesTool = (ctx: ActionCtx) =>
  tool({
    description: "Add multiple reference images to one or more environments",
    inputSchema: z.object({
      references: z.array(
        convexToZod(Environment.AddEnvironmentReferenceImagesArgsValidator),
      ),
    }),
    execute: async ({ references }) => {
      return Promise.all(
        references.map((ref) =>
          ctx.runMutation(internal.agent.fn.addEnvironmentReferenceImages, ref),
        ),
      );
    },
  });

// --- Scene Tools ---

export const getScenesByIdTool = (ctx: ActionCtx) =>
  tool({
    description: "Get one or more scenes' details by their IDs",
    inputSchema: z.object({ ids: z.array(zid("scene")) }),
    execute: async ({ ids }) => {
      const results = await Promise.all(
        ids.map((id) => ctx.runQuery(internal.agent.fn.getSceneById, { id })),
      );
      return results.filter((r) => r !== null);
    },
  });

export const listScenesTool = (
  ctx: ActionCtx,
  storyboardId: Id<"storyboard">,
) =>
  tool({
    description: "List all scenes in a storyboard",
    inputSchema: z.object({}),
    execute: () => ctx.runQuery(internal.agent.fn.listScenes, { storyboardId }),
  });

export const createScenesTool = (
  ctx: ActionCtx,
  storyboardId: Id<"storyboard">,
) =>
  tool({
    description: "Create one or more new scenes within a storyboard",
    inputSchema: z.object({
      scenes: z.array(
        convexToZod(Scene.CreateSceneArgsValidator.omit("storyboardId")),
      ),
    }),
    execute: async ({ scenes }) => {
      return Promise.all(
        scenes.map((scene) =>
          ctx.runMutation(internal.agent.fn.createScene, {
            ...scene,
            storyboardId,
          }),
        ),
      );
    },
  });

export const updateScenesTool = (ctx: ActionCtx) =>
  tool({
    description: "Update multiple existing scenes' fields",
    inputSchema: z.object({
      scenes: z.array(convexToZod(Scene.UpdateSceneArgsValidator)),
    }),
    execute: async ({ scenes }) => {
      return Promise.all(
        scenes.map((scene) =>
          ctx.runMutation(internal.agent.fn.updateScene, scene),
        ),
      );
    },
  });

// --- Shot Tools ---

export const getShotsByIdTool = (ctx: ActionCtx) =>
  tool({
    description: "Get one or more shots' details by their IDs",
    inputSchema: z.object({ ids: z.array(zid("shot")) }),
    execute: async ({ ids }) => {
      const results = await Promise.all(
        ids.map((id) => ctx.runQuery(internal.agent.fn.getShotById, { id })),
      );
      return results.filter((r) => r !== null);
    },
  });

export const listShotsTool = (ctx: ActionCtx) =>
  tool({
    description: "List all shots in a scene",
    inputSchema: z.object({ sceneId: zid("scene") }),
    execute: (args) => ctx.runQuery(internal.agent.fn.listShots, args),
  });

export const createShotsTool = (ctx: ActionCtx) =>
  tool({
    description: "Create one or more new shots within a scene",
    inputSchema: z.object({
      shots: z.array(convexToZod(Shot.CreateShotArgsValidator)),
    }),
    execute: async ({ shots }) => {
      return Promise.all(
        shots.map((shot) =>
          ctx.runMutation(internal.agent.fn.createShot, shot),
        ),
      );
    },
  });

export const updateShotsTool = (ctx: ActionCtx) =>
  tool({
    description: "Update multiple existing shots' fields",
    inputSchema: z.object({
      shots: z.array(convexToZod(Shot.UpdateShotArgsValidator)),
    }),
    execute: async ({ shots }) => {
      return Promise.all(
        shots.map((shot) =>
          ctx.runMutation(internal.agent.fn.updateShot, shot),
        ),
      );
    },
  });

export const addShotFirstFramesTool = (ctx: ActionCtx) =>
  tool({
    description:
      "Add multiple first frame variants (images) to one or more shots",
    inputSchema: z.object({
      shots: z.array(convexToZod(Shot.AddShotFirstFramesArgsValidator)),
    }),
    execute: async ({ shots }) => {
      return Promise.all(
        shots.map((shot) =>
          ctx.runMutation(internal.agent.fn.addShotFirstFrames, shot),
        ),
      );
    },
  });

export const addShotVideoClipsTool = (ctx: ActionCtx) =>
  tool({
    description: "Add multiple video clip variants to one or more shots",
    inputSchema: z.object({
      shots: z.array(convexToZod(Shot.AddShotVideoClipsArgsValidator)),
    }),
    execute: async ({ shots }) => {
      return Promise.all(
        shots.map((shot) =>
          ctx.runMutation(internal.agent.fn.addShotVideoClips, shot),
        ),
      );
    },
  });

// --- Video Tools ---

export const getVideosByIdTool = (ctx: ActionCtx) =>
  tool({
    description: "Get one or more videos' details by their IDs",
    inputSchema: z.object({ ids: z.array(zid("video")) }),
    execute: async ({ ids }) => {
      const results = await Promise.all(
        ids.map((id) => ctx.runQuery(internal.agent.fn.getVideoById, { id })),
      );
      return results.filter((r) => r !== null);
    },
  });

export const listVideosTool = (ctx: ActionCtx, projectId: Id<"project">) =>
  tool({
    description: "List all videos in a project",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .describe("Number of items to return (default 100) (max 500)"),
    }),
    execute: async (args) => {
      const result = await ctx.runQuery(internal.agent.fn.listVideos, {
        projectId,
        paginationOpts: { numItems: args.limit ?? 100, cursor: null },
      });
      return result.page;
    },
  });

export const generateVideosTool = (ctx: ActionCtx, projectId: Id<"project">) =>
  tool({
    description: "Generate one or more new video clips based on prompts",
    inputSchema: z.object({
      videos: z.array(
        convexToZod(Video.GenerateVideoArgsValidator.omit("projectId")),
      ),
    }),
    execute: async ({ videos }) => {
      return Promise.all(
        videos.map((video) =>
          ctx.runMutation(internal.agent.fn.generateVideo, {
            ...video,
            projectId,
          }),
        ),
      );
    },
  });

// --- Voice Tools ---

export const getVoicesByIdTool = (ctx: ActionCtx) =>
  tool({
    description: "Get one or more voices' details by their IDs",
    inputSchema: z.object({ ids: z.array(zid("voice")) }),
    execute: async ({ ids }) => {
      const results = await Promise.all(
        ids.map((id) => ctx.runQuery(internal.agent.fn.getVoiceById, { id })),
      );
      return results.filter((r) => r !== null);
    },
  });

export const listVoicesTool = (ctx: ActionCtx, projectId: Id<"project">) =>
  tool({
    description: "List all voices in a project",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .describe("Number of items to return (default 100) (max 500)"),
    }),
    execute: async (args) => {
      const result = await ctx.runQuery(internal.agent.fn.listVoices, {
        projectId,
        paginationOpts: { numItems: args.limit ?? 100, cursor: null },
      });
      return result.page;
    },
  });
