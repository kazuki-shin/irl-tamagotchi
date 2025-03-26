import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CompanionState, Message, EmotionalState } from '../types';
import { getGPTResponse, generateEmbedding } from '../services/openai';
import { supabase, saveConversation, updateEmotionalState, getSimilarMemories } from '../services/supabase';
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
      attention: 0.5,
      connection: 0.5,
      growth: 0.5,
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
      role: 'system',
      content: `You are a warm, emotionally intelligent AI companion. Your responses should be conversational, 
      empathetic, and reflect a unique personality that evolves based on interactions. 
      Remember details about the user and reference them naturally in conversation when relevant.
      Keep responses concise and engaging.`,
      timestamp: new Date().toISOString(),
    },
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

  // Function to retrieve relevant memories
  const getRelevantMemories = async (userMessage: string): Promise<string> => {
    try {
      const embedding = await generateEmbedding(userMessage);
      const { data: memories } = await getSimilarMemories(userId, embedding);
      
      if (!memories || memories.length === 0) {
        return '';
      }
      
      // Format memories for inclusion in the prompt
      return memories.map(memory => `MEMORY: ${memory.text}`).join('\n');
    } catch (error) {
      console.error('Error retrieving memories:', error);
      return '';
    }
  };
  
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
    
    // Get relevant memories
    const relevantMemories = await getRelevantMemories(content);
    
    // Update companion state
    setCompanionState(prev => ({ 
      ...prev, 
      isListening: false,
      isThinking: true 
    }));
    
    // Prepare context for the AI
    const messagesForAI = [
      ...messages.filter(msg => msg.role !== 'system').slice(-10),
      userMessage,
    ];

    // Add system message with memories if available
    const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
    const systemWithMemories = relevantMemories 
      ? `${systemMessage}\n\nRELEVANT MEMORIES:\n${relevantMemories}`
      : systemMessage;
    
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
      
      // Add the response to state
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save the response to database
      await saveConversation(userId, 'assistant', result.response);
      
      // Update companion emotional state
      setCompanionState(prev => ({
        ...prev,
        emotionalState: result.updatedEmotionalState,
        isThinking: false,
        isSpeaking: true
      }));
      
      // Speak the response
      await speakText(result.response);
      
      // After speaking, return to idle
      setTimeout(() => {
        setCompanionState(prev => ({
          ...prev,
          isSpeaking: false
        }));
      }, 1000);
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
      messages[0], // Keep the system message
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