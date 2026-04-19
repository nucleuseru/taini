import { google } from "@ai-sdk/google";
import { Agent, stepCountIs } from "@convex-dev/agent";
import { ConvexError, v } from "convex/values";
import { api, components } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { authAction } from "../function";
import { RunMutationCtx, RunQueryCtx } from "../utils";
import {
  CREATE_CHARACTERS_AND_ENVIRONMENTS_PROMPT,
  SYSTEM_PROMPT,
} from "./prompts";
import * as tools from "./tools";

export const createAgent = (
  ctx: RunQueryCtx & RunMutationCtx,
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

export const createCharactersAndEnvironments = authAction({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(api.project.get, { id: args.projectId });
    const storyboard = await ctx.runQuery(api.storyboard.getByProject, args);

    if (!project) {
      throw new ConvexError("Project does not exist");
    }

    if (!storyboard) {
      throw new ConvexError("No storyboard exist in the project");
    }

    const agent = createAgent(ctx, {
      script: storyboard.script,
      projectId: args.projectId,
      projectName: project.name,
      storyboardId: storyboard._id,
    });

    const { thread } = storyboard.threadId
      ? await agent.continueThread(ctx, {
          userId: ctx.user._id,
          threadId: storyboard.threadId,
        })
      : await agent.createThread(ctx, {
          userId: ctx.user._id,
        });

    if (!storyboard.threadId) {
      await ctx.runMutation(api.storyboard.update, {
        id: storyboard._id,
        threadId: thread.threadId,
      });
    }

    await thread.generateText({
      prompt: CREATE_CHARACTERS_AND_ENVIRONMENTS_PROMPT,
      activeTools: [
        "listImages",
        "listCharacters",
        "listEnvironments",
        "generateImages",
        "createCharacters",
        "createEnvironments",
        "addCharacterReferenceImages",
        "addEnvironmentReferenceImages",
      ],
    });
  },
});
