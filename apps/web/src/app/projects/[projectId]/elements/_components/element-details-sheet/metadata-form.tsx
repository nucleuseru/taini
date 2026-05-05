"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Controller } from "react-hook-form";
import { useElementDetails } from "./context";

export function ElementDetailsMetadataForm() {
  const { element, form } = useElementDetails();

  return (
    <form className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
        <div className="sm:col-span-8">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                >
                  Element Name
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="The name of your asset..."
                  className="h-11 border-none bg-white/3 text-sm font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {element.type === "character" && (
          <div className="sm:col-span-4">
            <Controller
              name="age"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                  >
                    Age / Era
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="e.g. 24, Ancient"
                    className="h-11 border-none bg-white/3 text-sm font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        )}
      </div>

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              htmlFor={field.name}
              className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
            >
              Description & Role
            </FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder="Primary role and back story..."
              className="min-h-[100px] border-none bg-white/3 text-sm leading-relaxed font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {element.type === "character" && (
        <div className="space-y-8">
          <Controller
            name="appearance"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                >
                  Physical Appearance
                </FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Height, clothes, features..."
                  className="min-h-[100px] border-none bg-white/3 text-sm leading-relaxed font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="personality"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#e5e2e1]/30 uppercase"
                >
                  Personality Traits
                </FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="How they speak, act, and react..."
                  className="min-h-[100px] border-none bg-white/3 text-sm leading-relaxed font-medium tracking-wide text-[#e5e2e1] transition-colors focus:bg-white/6"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      )}
    </form>
  );
}
