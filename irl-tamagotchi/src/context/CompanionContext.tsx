import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CompanionState, Message, EmotionalState } from '../types';
import { supabase, saveConversation } from '../services/supabase';
import { speakText } from '../services/elevenlabs';
import aiService from '../services/ai-service';

interface CompanionContextType {
  companionState: CompanionState;
  messages: Message[];
  addUserMessage: (content: string) => Promise<void>;
  isProcessing: boolean;
  resetConversation: () => void;
  userId: string;
}

const CompanionContext = createContext<CompanionContextType | undefined>(undefined);

export const useCompanion = () => {
  const context = useContext(CompanionContext);
  if (!context) {
    throw new Error('useCompanion must be used within a CompanionProvider');
  }
  return context;
};

interface CompanionProviderProps {
  children: ReactNode;
}

export const CompanionProvider: React.FC<CompanionProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string>('');
  const [companionState, setCompanionState] = useState<CompanionState>({
    emotionalState: {
      attention: 0.8,
      connection: 0.7,
      growth: 0.6,
      play: 0.5
    },
    currentActivity: 'idle',
    isThinking: false,
    isListening: false,
    isSpeaking: false,
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: "Hi there! I'm your GPTamagotchi companion. I'm here to chat, play games, and get to know you better over time. What would you like to talk about today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initialize user ID from localStorage or create a new one
  useEffect(() => {
    const storedUserId = localStorage.getItem('companionUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = uuidv4();
      localStorage.setItem('companionUserId', newUserId);
      setUserId(newUserId);
    }
  }, []);

  // Function to add a user message and get a response
  const addUserMessage = async (content: string) => {
    if (!content.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setCompanionState(prev => ({ ...prev, isListening: true }));
    
    // Create new user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    // Add user message to state
    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to database
    await saveConversation(userId, 'user', content);
    
    // Update companion state
    setCompanionState(prev => ({ 
      ...prev, 
      isListening: false,
      isThinking: true 
    }));
    
    try {
      // Process the message using AI service
      const result = await aiService.processUserInput(
        userId,
        content,
        messages,
        companionState.emotionalState
      );
      
      // Create AI response message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
      };
      
      // Update companion state
      setCompanionState(prev => ({
        ...prev,
        emotionalState: result.updatedEmotionalState,
        isThinking: false,
        isSpeaking: true
      }));
      
      // Add assistant message to state
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to database
      await saveConversation(userId, 'assistant', result.response);
      
      // Speak the response
      await speakText(result.response);
      
      // Update companion state after speaking
      setCompanionState(prev => ({ 
        ...prev, 
        isSpeaking: false
      }));
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Handle error with fallback response
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "I'm having trouble understanding right now. Can we try again?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setCompanionState(prev => ({
        ...prev,
        isThinking: false
      }));
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to reset conversation
  const resetConversation = () => {
    setMessages([
      {
        id: uuidv4(),
        role: 'assistant',
        content: "Let's start fresh! How can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };
  
  const contextValue: CompanionContextType = {
    companionState,
    messages,
    addUserMessage,
    isProcessing,
    resetConversation,
    userId,
  };
  
  return (
    <CompanionContext.Provider value={contextValue}>
      {children}
    </CompanionContext.Provider>
  );
};

export default CompanionContext; 