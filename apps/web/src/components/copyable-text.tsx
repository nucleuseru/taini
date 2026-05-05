"use client";

import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

interface CopyableTextProps {
  text: string;
  className?: string;
}

export function CopyableText({ text, className }: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      void 0;
    }
  };

  return (
    <div
      className={cn(
        "relative flex cursor-pointer items-start gap-2",
        className,
      )}
      onClick={() => void handleCopy()}
    >
      <div className="flex-1">{text}</div>
      <div className="mt-0.5 shrink-0">
        {copied ? (
          <CheckIcon size={14} className="text-green-500" />
        ) : (
          <CopyIcon
            size={14}
            className="text-muted-foreground transition-all"
          />
        )}
      </div>
    </div>
  );
}
