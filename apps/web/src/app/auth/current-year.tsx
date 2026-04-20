"use client";

export function CurrentYear(props: React.ComponentProps<"span">) {
  return <span {...props}>{new Date().getFullYear()}</span>;
}
