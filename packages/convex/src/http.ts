import { httpRouter } from "convex/server";
import * as Audio from "./audio";
import { authComponent, createAuth } from "./auth";
import * as Image from "./image";
import * as Video from "./video";
import * as Voice from "./voice";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/webhook/image",
  method: "POST",
  handler: Image.webhook,
});

http.route({
  path: "/webhook/video",
  method: "POST",
  handler: Video.webhook,
});

http.route({
  path: "/webhook/audio/tts",
  method: "POST",
  handler: Audio.webhookTts,
});

http.route({
  path: "/webhook/audio/stt",
  method: "POST",
  handler: Audio.webhookStt,
});

http.route({
  path: "/webhook/voice",
  method: "POST",
  handler: Voice.webhook,
});

export default http;
