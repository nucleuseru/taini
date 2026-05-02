import { v, Validator } from "convex/values";
import { ActionCtx } from "./_generated/server";

export const optional = <Type, FieldPaths extends string = never>(
  validator: Validator<Type, "required", FieldPaths>,
) => v.optional(v.nullable(validator));

export const sleep = (delay: number) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const generateRandomInt = (max: number, min = 0) => {
  return Math.floor(Math.random() * (max - min));
};

export const generationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("queued"),
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

export interface RunPodData<T = undefined> {
  id: string;
  output: T;
  error?: unknown;
  status: "IN_QUEUE" | "IN_PROGRESS" | "FAILED" | "COMPLETED" | "CANCELLED";
}
