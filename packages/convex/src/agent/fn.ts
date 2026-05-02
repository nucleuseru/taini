import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import * as Audio from "../audio";
import * as Character from "../character";
import * as Environment from "../environment";
import { internalMutation } from "../function";
import * as Image from "../image";
import * as Item from "../item";
import * as Scene from "../scene";
import * as Shot from "../shot";
import * as Video from "../video";
import * as Voice from "../voice";

// Image
export const listImages = internalQuery({
  args: Image.ListImageArgsValidator,
  handler: (ctx, args) => Image.listImagesHandler(ctx, args),
});

export const generateImage = internalMutation({
  args: Image.GenerateImageArgsValidator.omit("width", "height").extend({
    storyboardId: v.id("storyboard"),
  }),
  handler: async (ctx, args) => {
    const { storyboardId, ...rest } = args;
    const storyboard = await ctx.db.get(storyboardId);
    if (!storyboard) throw new Error("Storyboard not found");

    return Image.generateImageHandler(ctx, {
      ...rest,
      width: storyboard.width,
      height: storyboard.height,
    });
  },
});

// Audio
export const listAudios = internalQuery({
  args: Audio.ListAudioArgsValidator,
  handler: (ctx, args) => Audio.listAudiosHandler(ctx, args),
});

export const generateAudio = internalMutation({
  args: Audio.GenerateAudioArgsValidator,
  handler: (ctx, args) => Audio.generateAudioHandler(ctx, args),
});

// Character
export const listCharacters = internalQuery({
  args: Character.ListCharacterArgsValidator,
  handler: (ctx, args) => Character.listCharactersHandler(ctx, args),
});

export const createCharacter = internalMutation({
  args: Character.CreateCharacterArgsValidator,
  handler: (ctx, args) => Character.createCharacterHandler(ctx, args),
});

export const addCharacterReferenceImages = internalMutation({
  args: Character.AddCharacterReferenceImagesArgsValidator,
  handler: (ctx, args) =>
    Character.addCharacterReferenceImagesHandler(ctx, args),
});

// Environment
export const listEnvironments = internalQuery({
  args: Environment.ListEnvironmentArgsValidator,
  handler: (ctx, args) => Environment.listEnvironmentsHandler(ctx, args),
});

export const createEnvironment = internalMutation({
  args: Environment.CreateEnvironmentArgsValidator,
  handler: (ctx, args) => Environment.createEnvironmentHandler(ctx, args),
});

export const addEnvironmentReferenceImages = internalMutation({
  args: Environment.AddEnvironmentReferenceImagesArgsValidator,
  handler: (ctx, args) =>
    Environment.addEnvironmentReferenceImagesHandler(ctx, args),
});

// Item
export const listItems = internalQuery({
  args: Item.ListItemArgsValidator,
  handler: (ctx, args) => Item.listItemsHandler(ctx, args),
});

export const createItem = internalMutation({
  args: Item.CreateItemArgsValidator,
  handler: (ctx, args) => Item.createItemHandler(ctx, args),
});

export const addItemReferenceImages = internalMutation({
  args: Item.AddItemReferenceImagesArgsValidator,
  handler: (ctx, args) => Item.addItemReferenceImagesHandler(ctx, args),
});

// Scene
export const listScenes = internalQuery({
  args: Scene.ListSceneArgsValidator,
  handler: (ctx, args) => Scene.listScenesHandler(ctx, args),
});

export const createScene = internalMutation({
  args: Scene.CreateSceneArgsValidator,
  handler: (ctx, args) => Scene.createSceneHandler(ctx, args),
});

// Shot
export const listShots = internalQuery({
  args: Shot.ListShotArgsValidator,
  handler: (ctx, args) => Shot.listShotsHandler(ctx, args),
});

export const createShot = internalMutation({
  args: Shot.CreateShotArgsValidator,
  handler: (ctx, args) => Shot.createShotHandler(ctx, args),
});

export const addShotStartFrames = internalMutation({
  args: Shot.AddShotStartFramesArgsValidator,
  handler: (ctx, args) => Shot.addShotStartFramesHandler(ctx, args),
});

export const addShotEndFrames = internalMutation({
  args: Shot.AddShotEndFramesArgsValidator,
  handler: (ctx, args) => Shot.addShotEndFramesHandler(ctx, args),
});

export const addShotVideoClips = internalMutation({
  args: Shot.AddShotVideoClipsArgsValidator,
  handler: (ctx, args) => Shot.addShotVideoClipsHandler(ctx, args),
});

// Video
export const listVideos = internalQuery({
  args: Video.ListVideoArgsValidator,
  handler: (ctx, args) => Video.listVideosHandler(ctx, args),
});

export const generateVideo = internalMutation({
  args: Video.GenerateVideoArgsValidator.omit(
    "width",
    "height",
    "frameRate",
  ).extend({
    storyboardId: v.id("storyboard"),
  }),
  handler: async (ctx, args) => {
    const { storyboardId, ...rest } = args;
    const storyboard = await ctx.db.get(storyboardId);
    if (!storyboard) throw new Error("Storyboard not found");

    return Video.generateVideoHandler(ctx, {
      ...rest,
      width: storyboard.width,
      height: storyboard.height,
      frameRate: storyboard.frameRate,
    });
  },
});

// Voice
export const listVoices = internalQuery({
  args: Voice.ListVoiceArgsValidator,
  handler: (ctx, args) => Voice.listVoicesHandler(ctx, args),
});
