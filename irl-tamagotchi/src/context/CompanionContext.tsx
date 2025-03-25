import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CompanionState, Message, EmotionalState, Memory } from '../types';
import { getGPTResponse, generateEmbedding } from '../services/openai';
import { supabase, saveConversation, updateEmotionalState, getSimilarMemories } from '../services/supabase';
import { speakText } from '../services/elevenlabs';

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
      attention: 1.0,
      connection: 1.0,
      growth: 1.0,
      play: 1.0
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
      content: "Hi there! I'm your AI companion. How are you feeling today?",
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
      return memories.map((memory: Memory) => `MEMORY: ${memory.text}`).join('\n');
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
      // Get response from AI
      const aiResponse = await getGPTResponse([
        { role: 'system', content: systemWithMemories },
        ...messagesForAI.map(msg => ({ role: msg.role, content: msg.content })),
      ]);
      
      // Create assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };
      
      // Update companion state
      setCompanionState(prev => ({ 
        ...prev, 
        isThinking: false,
        isSpeaking: true 
      }));
      
      // Add assistant message to state
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to database
      await saveConversation(userId, 'assistant', aiResponse);
      
      // Update emotional state based on conversation
      updateEmotionalStateFromConversation(content, aiResponse);
      
      // Speak the response
      await speakText(aiResponse);
      
      // Update companion state after speaking
      setCompanionState(prev => ({ 
        ...prev, 
        isSpeaking: false
      }));
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to update emotional state based on conversation
  const updateEmotionalStateFromConversation = async (userMessage: string, aiResponse: string) => {
    // Simple implementation - in a real app, you might use sentiment analysis
    const newEmotionalState: EmotionalState = { ...companionState.emotionalState };
    
    // Example: Increase connection if user message is longer (more detailed)
    if (userMessage.length > 50) {
      newEmotionalState.connection = Math.min(1.0, newEmotionalState.connection + 0.05);
    }
    
    // Example: Increase growth if new topics are discussed
    // This is a placeholder - you would need more sophisticated analysis
    newEmotionalState.growth = Math.min(1.0, newEmotionalState.growth + 0.02);
    
    // Update state locally
    setCompanionState(prev => ({
      ...prev,
      emotionalState: newEmotionalState
    }));
    
    // Save to database
    await updateEmotionalState(userId, newEmotionalState);
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