/* eslint-disable no-restricted-imports */
import { httpAction, mutation } from "./_generated/server";

export const generateUrl = mutation({
  args: {},
  handler: (ctx) => ctx.storage.generateUploadUrl(),
});

export const generateUploadUrl = httpAction(async (ctx) => {
  const url = await ctx.storage.generateUploadUrl();
  return Response.json({ url });
});
