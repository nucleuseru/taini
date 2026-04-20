import { v, Validator } from "convex/values";
import { ActionCtx } from "./_generated/server";

export const optional = <Type, FieldPaths extends string = never>(
  validator: Validator<Type, "required", FieldPaths>,
) => v.optional(v.nullable(validator));

export const sleep = (delay: number) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const generationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("generating"),
  v.literal("completed"),
  v.literal("failed"),
);

export const sortOrderValidator = v.union(v.literal("asc"), v.literal("desc"));

export interface RunQueryCtx {
  runQuery: ActionCtx["runQuery"];
}

export interface RunMutationCtx {
  runMutation: ActionCtx["runMutation"];
}

export interface RunActionCtx {
  runAction: ActionCtx["runAction"];
}
