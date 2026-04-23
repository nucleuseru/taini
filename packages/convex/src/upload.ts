import { mutation } from "./function";

export const generateUrl = mutation({
  args: {},
  handler: (ctx) => ctx.storage.generateUploadUrl(),
});
