// Define Tamagotchi type for state management
export interface Tamagotchi {
  name: string;
  mood: 'happy' | 'neutral' | 'sad';
  energy: number;
  hunger: number;
  social: number;
  hygiene: number;
  fun: number;
  lastInteractionAt: string;
}

// Message for chat interface
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// Emotional state types
export interface EmotionalState extends Record<string, number> {
  attention: number;
  connection: number;
  growth: number;
  play: number;
}

// Memory types
export interface Memory {
  id: string;
  user_id: string;
  embedding: number[];
  text: string;
  source: 'conversation' | 'summary' | 'core_memory' | 'emotion_pattern';
  timestamp: string;
  emotional_impact: number;
  memory_type: 'episodic' | 'summary' | 'fact' | 'pattern';
}

// Companion state
export interface CompanionState {
  emotionalState: EmotionalState;
  currentActivity?: string;
  isThinking: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

// Audio recording state
export interface AudioRecordingState {
  isRecording: boolean;
  audioURL: string | null;
  audioBlob: Blob | null;
  transcription: string;
  isTranscribing: boolean;
}

// Other types can be added here as needed 