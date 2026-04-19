import { google } from "@ai-sdk/google";
import { Agent, stepCountIs } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { ActionCtx } from "../_generated/server";
import { SYSTEM_PROMPT } from "./prompt";
import * as tools from "./tools";

export const createAgent = (
  ctx: ActionCtx,
  options: {
    script: string;
    projectName: string;
    projectId: Id<"project">;
    storyboardId: Id<"storyboard">;
  },
) => {
  const { projectId, storyboardId } = options;

  return new Agent(components.agent, {
    name: "Author",
    stopWhen: stepCountIs(15),
    instructions: SYSTEM_PROMPT,
    languageModel: google.chat("gemini-3.1-flash-lite-preview"),
    contextHandler: (_, args) => {
      return [
        { role: "user", content: `Project Name: ${options.projectName}` },
        { role: "user", content: `Film Script: ${options.script}` },
        ...args.search,
        ...args.recent,
        ...args.inputMessages,
        ...args.inputPrompt,
        ...args.existingResponses,
      ];
    },
    tools: {
      // Image
      // getImagesById: tools.getImagesByIdTool(ctx),
      listImages: tools.listImagesTool(ctx, projectId),
      generateImages: tools.generateImagesTool(ctx, projectId),

      // Audio
      // getAudiosById: tools.getAudiosByIdTool(ctx),
      listAudios: tools.listAudiosTool(ctx, projectId),
      generateAudios: tools.generateAudiosTool(ctx, projectId),

      // Character
      // getCharactersById: tools.getCharactersByIdTool(ctx),
      listCharacters: tools.listCharactersTool(ctx, projectId),
      createCharacters: tools.createCharactersTool(ctx, projectId),
      // updateCharacters: tools.updateCharactersTool(ctx),
      addCharacterReferenceImages: tools.addCharacterReferenceImagesTool(ctx),

      // Environment
      // getEnvironmentsById: tools.getEnvironmentsByIdTool(ctx),
      listEnvironments: tools.listEnvironmentsTool(ctx, projectId),
      createEnvironments: tools.createEnvironmentsTool(ctx, projectId),
      // updateEnvironments: tools.updateEnvironmentsTool(ctx),
      addEnvironmentReferenceImages:
        tools.addEnvironmentReferenceImagesTool(ctx),

      // Scene
      // getScenesById: tools.getScenesByIdTool(ctx),
      listScenes: tools.listScenesTool(ctx, storyboardId),
      createScenes: tools.createScenesTool(ctx, storyboardId),
      // updateScenes: tools.updateScenesTool(ctx),

      // Shot
      // getShotsById: tools.getShotsByIdTool(ctx),
      listShots: tools.listShotsTool(ctx),
      createShots: tools.createShotsTool(ctx),
      // updateShots: tools.updateShotsTool(ctx),
      addShotFirstFrames: tools.addShotFirstFramesTool(ctx),
      addShotVideoClips: tools.addShotVideoClipsTool(ctx),

      // Video
      // getVideosById: tools.getVideosByIdTool(ctx),
      listVideos: tools.listVideosTool(ctx, projectId),
      generateVideos: tools.generateVideosTool(ctx, projectId),

      // Voice
      // getVoicesById: tools.getVoicesByIdTool(ctx),
      listVoices: tools.listVoicesTool(ctx, projectId),
    },
  });
};
