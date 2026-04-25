/* eslint-disable no-restricted-imports */
import { mutation } from "./_generated/server";

export const generateUrl = mutation({
  args: {},
  handler: (ctx) => ctx.storage.generateUploadUrl(),
});
