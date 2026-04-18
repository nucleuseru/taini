import { v, Validator } from "convex/values";

export const optional = <Type, FieldPaths extends string = never>(
  validator: Validator<Type, "required", FieldPaths>,
) => v.optional(v.nullable(validator));

export const generationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("generating"),
  v.literal("completed"),
  v.literal("failed"),
);

export const sortOrderValidator = v.union(v.literal("asc"), v.literal("desc"));
