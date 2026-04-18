import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import * as Audio from "../audio";
import * as Character from "../character";
import * as Environment from "../environment";
import { internalMutation } from "../function";
import * as Image from "../image";
import * as Scene from "../scene";
import * as Shot from "../shot";
import * as Video from "../video";
import * as Voice from "../voice";

// Image
export const getImageById = internalQuery({
  args: { id: v.id("image") },
  handler: (ctx, args) => Image.getImageByIdHandler(ctx, args.id),
});

export const listImages = internalQuery({
  args: Image.ListImageArgsValidator,
  handler: (ctx, args) => Image.listImagesHandler(ctx, args),
});

export const generateImage = internalMutation({
  args: Image.GenerateImageArgsValidator,
  handler: (ctx, args) => Image.generateImageHandler(ctx, args),
});

// Audio
export const getAudioById = internalQuery({
  args: { id: v.id("audio") },
  handler: (ctx, args) => Audio.getAudioByIdHandler(ctx, args.id),
});

export const listAudios = internalQuery({
  args: Audio.ListAudioArgsValidator,
  handler: (ctx, args) => Audio.listAudiosHandler(ctx, args),
});

export const generateAudio = internalMutation({
  args: Audio.GenerateAudioArgsValidator,
  handler: (ctx, args) => Audio.generateAudioHandler(ctx, args),
});

// Character
export const getCharacterById = internalQuery({
  args: { id: v.id("character") },
  handler: (ctx, args) => Character.getCharacterByIdHandler(ctx, args.id),
});

export const listCharacters = internalQuery({
  args: Character.ListCharacterArgsValidator,
  handler: (ctx, args) => Character.listCharactersHandler(ctx, args),
});

export const createCharacter = internalMutation({
  args: Character.CreateCharacterArgsValidator,
  handler: (ctx, args) => Character.createCharacterHandler(ctx, args),
});

export const updateCharacter = internalMutation({
  args: Character.UpdateCharacterArgsValidator,
  handler: (ctx, args) => Character.updateCharacterHandler(ctx, args),
});

export const addCharacterReferenceImage = internalMutation({
  args: Character.AddCharacterReferenceImageArgsValidator,
  handler: (ctx, args) =>
    Character.addCharacterReferenceImageHandler(ctx, args),
});

// Environment
export const getEnvironmentById = internalQuery({
  args: { id: v.id("environment") },
  handler: (ctx, args) => Environment.getEnvironmentByIdHandler(ctx, args.id),
});

export const listEnvironments = internalQuery({
  args: Environment.ListEnvironmentArgsValidator,
  handler: (ctx, args) => Environment.listEnvironmentsHandler(ctx, args),
});

export const createEnvironment = internalMutation({
  args: Environment.CreateEnvironmentArgsValidator,
  handler: (ctx, args) => Environment.createEnvironmentHandler(ctx, args),
});

export const updateEnvironment = internalMutation({
  args: Environment.UpdateEnvironmentArgsValidator,
  handler: (ctx, args) => Environment.updateEnvironmentHandler(ctx, args),
});

export const addEnvironmentReferenceImage = internalMutation({
  args: Environment.AddEnvironmentReferenceImageArgsValidator,
  handler: (ctx, args) =>
    Environment.addEnvironmentReferenceImageHandler(ctx, args),
});

// Scene
export const getSceneById = internalQuery({
  args: { id: v.id("scene") },
  handler: (ctx, args) => Scene.getSceneByIdHandler(ctx, args.id),
});

export const listScenes = internalQuery({
  args: Scene.ListSceneArgsValidator,
  handler: (ctx, args) => Scene.listScenesHandler(ctx, args),
});

export const createScene = internalMutation({
  args: Scene.CreateSceneArgsValidator,
  handler: (ctx, args) => Scene.createSceneHandler(ctx, args),
});

export const updateScene = internalMutation({
  args: Scene.UpdateSceneArgsValidator,
  handler: (ctx, args) => Scene.updateSceneHandler(ctx, args),
});

// Shot
export const getShotById = internalQuery({
  args: { id: v.id("shot") },
  handler: (ctx, args) => Shot.getShotByIdHandler(ctx, args.id),
});

export const listShots = internalQuery({
  args: Shot.ListShotArgsValidator,
  handler: (ctx, args) => Shot.listShotsHandler(ctx, args),
});

export const createShot = internalMutation({
  args: Shot.CreateShotArgsValidator,
  handler: (ctx, args) => Shot.createShotHandler(ctx, args),
});

export const updateShot = internalMutation({
  args: Shot.UpdateShotArgsValidator,
  handler: (ctx, args) => Shot.updateShotHandler(ctx, args),
});

export const addShotFirstFrame = internalMutation({
  args: Shot.AddShotFirstFrameArgsValidator,
  handler: (ctx, args) => Shot.addShotFirstFrameHandler(ctx, args),
});

export const addShotVideoClip = internalMutation({
  args: Shot.AddShotVideoClipArgsValidator,
  handler: (ctx, args) => Shot.addShotVideoClipHandler(ctx, args),
});

// Video
export const getVideoById = internalQuery({
  args: { id: v.id("video") },
  handler: (ctx, args) => Video.getVideoByIdHandler(ctx, args.id),
});

export const listVideos = internalQuery({
  args: Video.ListVideoArgsValidator,
  handler: (ctx, args) => Video.listVideosHandler(ctx, args),
});

export const generateVideo = internalMutation({
  args: Video.GenerateVideoArgsValidator,
  handler: (ctx, args) => Video.generateVideoHandler(ctx, args),
});

// Voice
export const getVoiceById = internalQuery({
  args: { id: v.id("voice") },
  handler: (ctx, args) => Voice.getVoiceByIdHandler(ctx, args.id),
});

export const listVoices = internalQuery({
  args: Voice.ListVoiceArgsValidator,
  handler: (ctx, args) => Voice.listVoicesHandler(ctx, args),
});
