import { Doc, Id } from "@repo/convex/dataModel";

export type AudioTab = "tts" | "clone";

export type LoadingState =
  | "generate"
  | "clone"
  | "upload-audio"
  | "upload-voice"
  | "remove-audio"
  | "remove-voice"
  | null;

export interface AudioContextValue {
  projectId: Id<"project">;
  activeTab: AudioTab;
  setActiveTab: (tab: AudioTab) => void;

  // TTS State
  text: string;
  setText: (text: string) => void;
  selectedVoiceId: Id<"voice"> | null;
  setSelectedVoiceId: (id: Id<"voice"> | null) => void;
  selectedVoice: Doc<"voice"> | null | undefined;

  // Clone State
  voiceName: string;
  setVoiceName: (name: string) => void;
  selectedRefAudioId: Id<"audio"> | null;
  setSelectedRefAudioId: (id: Id<"audio"> | null) => void;
  selectedAudio: Doc<"audio"> | null | undefined;

  // UI State
  loading: LoadingState;
  setLoading: (state: LoadingState) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;

  handleGenerate: () => Promise<void>;
  handleClone: () => Promise<void>;
  handleRemoveAudio: (id: Id<"audio">) => Promise<void>;
  handleRemoveVoice: (id: Id<"voice">) => Promise<void>;
}
