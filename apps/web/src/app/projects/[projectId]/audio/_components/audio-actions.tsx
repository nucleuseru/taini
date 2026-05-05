"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MicIcon, MoreHorizontalIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { TTSForm } from "./tts-form";
import { VoiceCloneForm } from "./voice-clone-form";

export function AudioActions() {
  const [isTTSOpen, setIsTTSOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="rounded-full">
            <MoreHorizontalIcon size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => {
              setIsTTSOpen(true);
            }}
          >
            <SparklesIcon size={16} />
            Generate Speech
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsCloneOpen(true);
            }}
          >
            <MicIcon size={16} />
            Clone Voice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TTSForm open={isTTSOpen} onOpenChange={setIsTTSOpen} />
      <VoiceCloneForm open={isCloneOpen} onOpenChange={setIsCloneOpen} />
    </>
  );
}

export function AudioActionsSkeleton() {
  return (
    <Button variant="ghost" size="sm" className="rounded-full">
      <MoreHorizontalIcon size={20} />
    </Button>
  );
}
