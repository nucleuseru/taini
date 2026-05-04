"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { AudioContextValue, AudioTab, LoadingState } from "./types";

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params.projectId as Id<"project">;
  const [activeTab, setActiveTab] = useState<AudioTab>("tts");
  const [loading, setLoading] = useState<LoadingState>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    variant?: "default" | "destructive";
  } | null>(null);

  // TTS State
  const [text, setText] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<Id<"voice"> | null>(
    null,
  );
  const selectedVoice = useQuery(
    api.voice.get,
    selectedVoiceId ? { id: selectedVoiceId } : "skip",
  );

  // Clone State
  const [voiceName, setVoiceName] = useState("");
  const [selectedRefAudioId, setSelectedRefAudioId] =
    useState<Id<"audio"> | null>(null);
  const selectedAudio = useQuery(
    api.audio.get,
    selectedRefAudioId ? { id: selectedRefAudioId } : "skip",
  );

  // Mutations
  const generateAudio = useMutation(api.audio.generate);
  const cloneVoice = useMutation(api.voice.clone);
  const removeAudio = useMutation(api.audio.remove);
  const removeVoice = useMutation(api.voice.remove);

  // UI State
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter text to convert to audio");
      return;
    }
    if (!selectedVoiceId) {
      toast.error("Please select a voice");
      return;
    }

    setLoading("generate");
    try {
      await generateAudio({
        projectId,
        text,
        title: text.slice(0, 20) + (text.length > 20 ? "..." : ""),
        referenceVoice: selectedVoiceId,
        ttsStatus: "queued",
      });

      toast.success("Audio generation queued");
      setText("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate audio");
    } finally {
      setLoading(null);
    }
  };

  const handleClone = async () => {
    if (!voiceName.trim()) {
      toast.error("Please enter a name for the voice");
      return;
    }
    if (!selectedRefAudioId) {
      toast.error("Please select or upload a reference audio");
      return;
    }

    setLoading("clone");
    try {
      await cloneVoice({
        projectId,
        name: voiceName,
        referenceAudio: selectedRefAudioId,
      });

      toast.success("Voice cloning queued");
      setVoiceName("");
      setSelectedRefAudioId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to clone voice");
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveAudio = async (id: Id<"audio">) => {
    setConfirmState({
      title: "Remove Audio",
      description:
        "Are you sure you want to remove this audio? This action cannot be undone.",
      variant: "destructive",
      onConfirm: async () => {
        setLoading("remove-audio");
        try {
          await removeAudio({ id });
          toast.success("Audio removed");
          if (selectedRefAudioId === id) setSelectedRefAudioId(null);
        } catch (error) {
          console.error(error);
          toast.error("Failed to remove audio");
        } finally {
          setLoading(null);
        }
      },
    });
  };

  const handleRemoveVoice = async (id: Id<"voice">) => {
    setConfirmState({
      title: "Remove Voice",
      description:
        "Are you sure you want to remove this voice clone? This action cannot be undone.",
      variant: "destructive",
      onConfirm: async () => {
        setLoading("remove-voice");
        try {
          await removeVoice({ id });
          toast.success("Voice removed");
          if (selectedVoiceId === id) setSelectedVoiceId(null);
        } catch (error) {
          console.error(error);
          toast.error("Failed to remove voice");
        } finally {
          setLoading(null);
        }
      },
    });
  };

  const value: AudioContextValue = {
    projectId,
    activeTab,
    setActiveTab,
    text,
    setText,
    selectedVoiceId,
    setSelectedVoiceId,
    selectedVoice,
    voiceName,
    setVoiceName,
    selectedRefAudioId,
    setSelectedRefAudioId,
    selectedAudio,
    loading,
    setLoading,
    isSheetOpen,
    setIsSheetOpen,
    handleGenerate,
    handleClone,
    handleRemoveAudio,
    handleRemoveVoice,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={!!confirmState}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        title={confirmState?.title ?? ""}
        description={confirmState?.description ?? ""}
        variant={confirmState?.variant}
        onConfirm={
          confirmState?.onConfirm
            ? () => void confirmState.onConfirm()
            : () => void 0
        }
      />
    </AudioContext.Provider>
  );
}
