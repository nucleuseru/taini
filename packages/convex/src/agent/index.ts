import { google } from "@ai-sdk/google";
import { Agent, stepCountIs } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { RunMutationCtx, RunQueryCtx } from "../utils";
import { SYSTEM_PROMPT } from "./prompts";
import * as tools from "./tools";

export const createAgent = (
  ctx: RunQueryCtx & RunMutationCtx,
  options: {
    name?: string;
    style?: string;
    script: string;
    styleRef?: string;
    projectName: string;
    projectId: Id<"project">;
    storyboardId: Id<"storyboard">;
  },
) => {
  const { projectId, storyboardId } = options;

  return new Agent(components.agent, {
    name: options.name ?? "FILM DIRECTOR",
    stopWhen: stepCountIs(200),
    instructions: SYSTEM_PROMPT,
    languageModel: google.chat("gemini-3.1-flash-lite-preview"),
    contextHandler: (_, args) => {
      return [
        { role: "user", content: `Project Name: ${options.projectName}` },
        { role: "user", content: `Film Script: ${options.script}` },
        ...(options.style
          ? [{ role: "user", content: `Film Style: ${options.style}` } as const]
          : []),
        ...(options.styleRef
          ? [
              {
                role: "user",
                content: `Style Reference Image ID: ${options.styleRef}`,
              } as const,
            ]
          : []),
        ...args.search,
        ...args.recent,
        ...args.inputMessages,
        ...args.inputPrompt,
        ...args.existingResponses,
      ];
    },
    tools: {
      // Image
      listImages: tools.listImagesTool(ctx, projectId),
      generateImages: tools.generateImagesTool(ctx, projectId, storyboardId),

      // Audio
      listAudios: tools.listAudiosTool(ctx, projectId),
      generateAudios: tools.generateAudiosTool(ctx, projectId),

      // Character
      listCharacters: tools.listCharactersTool(ctx, projectId),
      createCharacters: tools.createCharactersTool(ctx, projectId),
      addCharacterReferenceImages: tools.addCharacterReferenceImagesTool(ctx),

      // Environment
      listEnvironments: tools.listEnvironmentsTool(ctx, projectId),
      createEnvironments: tools.createEnvironmentsTool(ctx, projectId),
      addEnvironmentReferenceImages:
        tools.addEnvironmentReferenceImagesTool(ctx),

      // Item
      listItems: tools.listItemsTool(ctx, projectId),
      createItems: tools.createItemsTool(ctx, projectId),
      addItemReferenceImages: tools.addItemReferenceImagesTool(ctx),

      // Scene
      listScenes: tools.listScenesTool(ctx, storyboardId),
      createScenes: tools.createScenesTool(ctx, storyboardId),

      // Shot
      listShots: tools.listShotsTool(ctx),
      createShots: tools.createShotsTool(ctx),
      addShotStartFrames: tools.addShotStartFramesTool(ctx),
      addShotEndFrames: tools.addShotEndFramesTool(ctx),
      addShotVideoClips: tools.addShotVideoClipsTool(ctx),

      // Video
      listVideos: tools.listVideosTool(ctx, projectId),
      generateVideos: tools.generateVideosTool(ctx, projectId, storyboardId),

      // Voice
      listVoices: tools.listVoicesTool(ctx, projectId),
    },
  });
};
