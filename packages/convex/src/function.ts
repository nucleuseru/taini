import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import {
  action,
  query,
  /* eslint-disable no-restricted-imports */
  internalMutation as rawInternalMutation,
  mutation as rawMutation,
} from "./_generated/server";
import { authComponent } from "./auth";
import { triggers } from "./triggers";

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB),
);

export const authQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return { user };
  }),
);

export const authMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return { user };
  }),
);

export const authAction = customAction(
  action,
  customCtx(async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return { user };
  }),
);
