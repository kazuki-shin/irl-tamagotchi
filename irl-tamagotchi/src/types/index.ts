import React from 'react';

// User types
export interface User {
  id: string;
  created_at: string;
  name?: string;
  personality_settings: Record<string, any>;
  emotional_state: EmotionalState;
}

// Emotional state types
export interface EmotionalState extends Record<string, number> {
  attention: number;
  connection: number;
  growth: number;
  play: number;
}

// Conversation types
export interface Conversation {
  id: string;
  user_id: string;
  timestamp: string;
  role: 'user' | 'assistant';
  text: string;
  tone?: string;
  importance_marker: number;
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

// Engagement metrics
export interface EngagementMetrics {
  id: string;
  user_id: string;
  last_interaction: string;
  streak_count: number;
  total_interactions?: number;
  care_level?: number;
  unlocked_features?: Record<string, any>;
  collectibles?: Record<string, any>;
}

// Message for chat interface
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// Audio recording state
export interface AudioRecordingState {
  isRecording: boolean;
  audioURL: string | null;
  audioBlob: Blob | null;
  transcription: string;
  isTranscribing: boolean;
}

// Companion state
export interface CompanionState {
  emotionalState: EmotionalState;
  currentActivity: string;
  isThinking: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

// Mini-game
export interface MiniGame {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  component: React.ComponentType<any>;
} 