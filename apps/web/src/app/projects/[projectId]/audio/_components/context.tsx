"use client";

import { api } from "@repo/convex/api";
import { Id } from "@repo/convex/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React, { createContext, useContext, useRef, useState } from "react";
import { toast } from "sonner";
import {
  cloneVoice,
  generateAudio,
  getUploadUrl,
  removeAudio,
  removeVoice,
  uploadAudio,
  uploadVoice,
} from "../actions";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<AudioTab>("tts");
  const [loading, setLoading] = useState<LoadingState>(null);

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
      const res = await generateAudio({
        projectId,
        text,
        title: text.slice(0, 20) + (text.length > 20 ? "..." : ""),
        referenceVoice: selectedVoiceId,
      });

      if (res.success) {
        toast.success("Audio generation queued");
        setText("");
      } else {
        toast.error(res.error ?? "Failed to generate audio");
      }
    } catch {
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
      const res = await cloneVoice({
        projectId,
        name: voiceName,
        referenceAudio: selectedRefAudioId,
      });

      if (res.success) {
        toast.success("Voice cloning queued");
        setVoiceName("");
        setSelectedRefAudioId(null);
      } else {
        toast.error(res.error ?? "Failed to clone voice");
      }
    } catch {
      toast.error("Failed to clone voice");
    } finally {
      setLoading(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const modalType = activeTab === "clone" ? "upload-audio" : "upload-voice";
    setLoading(modalType);

    try {
      const postUrl = await getUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = (await result.json()) as {
        storageId: Id<"_storage">;
      };

      if (activeTab === "clone") {
        const res = await uploadAudio({
          projectId,
          title: `Ref: ${file.name}`,
          storageId,
        });

        if (res.success) {
          toast.success("Reference audio uploaded");
        } else {
          toast.error(res.error ?? "Failed to upload reference audio");
        }
      } else {
        const res = await uploadVoice({
          projectId,
          name: file.name.split(".")[0] ?? "Unnamed",
          storageId,
        });
        if (res.success) {
          toast.success("Voice uploaded successfully");
        } else {
          toast.error(res.error ?? "Failed to upload voice");
        }
      }
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setLoading(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAudio = async (id: Id<"audio">) => {
    if (!confirm("Are you sure you want to remove this audio?")) return;
    setLoading("remove-audio");
    try {
      const res = await removeAudio(id);
      if (res.success) {
        toast.success("Audio removed");
        if (selectedRefAudioId === id) setSelectedRefAudioId(null);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to remove audio");
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveVoice = async (id: Id<"voice">) => {
    if (!confirm("Are you sure you want to remove this voice?")) return;
    setLoading("remove-voice");
    try {
      const res = await removeVoice(id);
      if (res.success) {
        toast.success("Voice removed");
        if (selectedVoiceId === id) setSelectedVoiceId(null);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to remove voice");
    } finally {
      setLoading(null);
    }
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
    handleFileUpload,
    handleRemoveAudio,
    handleRemoveVoice,
    fileInputRef,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}
