"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Controller } from "react-hook-form";
import { useElementDetails } from "./context";

export function ElementDetailsMetadataForm() {
  const { element, form } = useElementDetails();

  return (
    <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              htmlFor={field.name}
              className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
            >
              Name
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              className="border-none bg-[#131313] text-[#e5e2e1]"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {element.type === "character" && (
        <Controller
          name="age"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor={field.name}
                className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
              >
                Age
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                className="border-none bg-[#131313] text-[#e5e2e1]"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      <div className="col-span-full">
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor={field.name}
                className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
              >
                Description
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                className="min-h-[80px] border-none bg-[#131313] text-[#e5e2e1]"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {element.type === "character" && (
        <>
          <div className="col-span-full">
            <Controller
              name="appearance"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
                  >
                    Appearance
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    className="min-h-[80px] border-none bg-[#131313] text-[#e5e2e1]"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <div className="col-span-full">
            <Controller
              name="personality"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] tracking-wider text-[#e5e2e1]/50 uppercase"
                  >
                    Personality
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    className="min-h-[80px] border-none bg-[#131313] text-[#e5e2e1]"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </>
      )}
    </form>
  );
}
