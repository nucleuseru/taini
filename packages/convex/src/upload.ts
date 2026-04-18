import { authMutation } from "./function";

export const generateUrl = authMutation({
  args: {},
  handler: (ctx) => ctx.storage.generateUploadUrl(),
});
