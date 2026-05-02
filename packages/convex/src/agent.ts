import { ConvexError, v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { ActionCtx, internalAction } from "./_generated/server";
import { createAgent } from "./agent/index";
import {
  CREATE_CHARACTERS_AND_ENVIRONMENTS_PROMPT,
  CREATE_SHOTS_AND_SCENES_PROMPT,
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

export const createCharactersAndEnvironmentsInternal = internalAction({
  args: { userId: v.string(), projectId: v.id("project") },
  handler: async (ctx, args) => {
    const thread = await getThread(ctx, args.userId, args.projectId);
    await thread.generateText({
      prompt: CREATE_CHARACTERS_AND_ENVIRONMENTS_PROMPT,
      activeTools: [
        "listImages",
        "listCharacters",
        "listEnvironments",
        "listItems",
        "generateImages",
        "createCharacters",
        "createEnvironments",
        "createItems",
        "addCharacterReferenceImages",
        "addEnvironmentReferenceImages",
        "addItemReferenceImages",
      ],
    });
  },
});

export const createShotsAndScenesInternal = internalAction({
  args: { userId: v.string(), projectId: v.id("project") },
  handler: async (ctx, args) => {
    const thread = await getThread(ctx, args.userId, args.projectId);
    await thread.generateText({
      prompt: CREATE_SHOTS_AND_SCENES_PROMPT,
      activeTools: [
        "listShots",
        "listScenes",
        "listImages",
        "listVideos",
        "listAudios",
        "listVoices",
        "listCharacters",
        "listEnvironments",
        "listItems",
        "createShots",
        "createScenes",
        "generateImages",
        "generateVideos",
        "generateAudios",
        "addShotVideoClips",
        "addShotStartFrames",
        "addShotEndFrames",
      ],
    });
  },
});

export const createCharactersAndEnvironments = authAction({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(
      0,
      internal.agent.createCharactersAndEnvironmentsInternal,
      { projectId: args.projectId, userId: ctx.user._id },
    );
  },
});

export const createShotsAndScenes = authAction({
  args: { projectId: v.id("project") },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(
      0,
      internal.agent.createShotsAndScenesInternal,
      { projectId: args.projectId, userId: ctx.user._id },
    );
  },
});
