import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { ActionCtx, internalAction } from "./_generated/server";
import { createAgent } from "./agent/index";
import {
  CREATE_CHARACTER_ENVIRONMENT_ITEM_PROMPT,
  CREATE_SHOT_SCENE_PROMPT,
  CREATE_VOICEOVER_DIALOGUE_PROMPT,
  IMAGE_PROMPTING_GUIDELINES,
  SYSTEM_PROMPT,
  VIDEO_PROMPTING_GUIDELINES,
} from "./agent/prompts";
import { authAction } from "./function";

const getThread = async (
  ctx: ActionCtx,
  userId: string,
  projectId: Id<"project">,
) => {
  const project = await ctx.runQuery(api.project.get, { id: projectId });
  const storyboard = await ctx.runQuery(api.storyboard.getByProject, {
    projectId,
  });

  if (!project) {
    throw new ConvexError("Project does not exist");
  }

  if (!storyboard) {
    throw new ConvexError("No storyboard exist in the project");
  }

  const agent = createAgent(ctx, {
    projectId,
    script: storyboard.script,
    projectName: project.name,
    storyboardId: storyboard._id,
    style: storyboard.style ?? undefined,
    styleRef: storyboard.referenceStyle ?? undefined,
  });

  const { thread } = !storyboard.threadId
    ? await agent.createThread(ctx, { userId })
    : await agent.continueThread(ctx, {
        userId,
        threadId: storyboard.threadId,
      });

  if (!storyboard.threadId) {
    await ctx.runMutation(api.storyboard.update, {
      id: storyboard._id,
      threadId: thread.threadId,
    });
  }

  return thread;
};

export const createVoiceOverDialogueInternal = internalAction({
  args: { userId: v.string(), projectId: v.id("project") },
  handler: async (ctx, args) => {
    const thread = await getThread(ctx, args.userId, args.projectId);
    await thread.generateText({
      prompt: CREATE_VOICEOVER_DIALOGUE_PROMPT,
      activeTools: ["listVoices", "listAudios", "generateAudios"],
    });
  },
});

export const createCharactersEnvironmentsItemsInternal = internalAction({
  args: { userId: v.string(), projectId: v.id("project") },
  handler: async (ctx, args) => {
    const thread = await getThread(ctx, args.userId, args.projectId);
    await thread.generateText({
      prompt: CREATE_CHARACTER_ENVIRONMENT_ITEM_PROMPT,
      system: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: IMAGE_PROMPTING_GUIDELINES },
      ] as unknown as string,
      activeTools: [
        "listItems",
        "listImages",
        "listCharacters",
        "listEnvironments",
        "createItems",
        "generateImages",
        "createCharacters",
        "createEnvironments",
        "addItemReferenceImages",
        "addCharacterReferenceImages",
        "addEnvironmentReferenceImages",
      ],
    });
  },
});

export const createShotsScenesInternal = internalAction({
  args: { userId: v.string(), projectId: v.id("project") },
  handler: async (ctx, args) => {
    const thread = await getThread(ctx, args.userId, args.projectId);
    await thread.generateText({
      prompt: CREATE_SHOT_SCENE_PROMPT,
      system: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: IMAGE_PROMPTING_GUIDELINES },
        { role: "system", content: VIDEO_PROMPTING_GUIDELINES },
      ] as unknown as string,
      activeTools: [
        "listShots",
        "listScenes",
        "listImages",
        "listVideos",
        "listAudios",
        "listItems",
        "listCharacters",
        "listEnvironments",
        "createShots",
        "createScenes",
        "generateImages",
        "generateVideos",
        "addShotVideoClips",
        "addShotStartFrames",
      ],
    });
  },
});

export const createVoiceOverDialogue = authAction({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(
      0,
      internal.agent.createVoiceOverDialogueInternal,
      { projectId: args.projectId, userId: ctx.user._id },
    );
  },
});

export const createCharactersEnvironmentsItems = authAction({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(
      0,
      internal.agent.createCharactersEnvironmentsItemsInternal,
      { projectId: args.projectId, userId: ctx.user._id },
    );
  },
});

export const createShotsScenes = authAction({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(0, internal.agent.createShotsScenesInternal, {
      projectId: args.projectId,
      userId: ctx.user._id,
    });
  },
});
