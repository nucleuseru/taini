import { v, Validator } from "convex/values";

export const optional = <Type, FieldPaths extends string = never>(
  validator: Validator<Type, "required", FieldPaths>,
) => v.optional(v.nullable(validator));

export const generationStatus = v.union(
  v.literal("pending"),
  v.literal("generating"),
  v.literal("completed"),
  v.literal("failed"),
);
