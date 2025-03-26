import SYSTEM_PROMPT from '../system-prompt';
import { supabase } from './supabase';
import { EmotionalState } from '../types';

/**
 * AI Service response type
 */
interface AIServiceResponse {
  response: string;
  updatedEmotionalState: EmotionalState;
}

/**
 * AI Service for GPTamagotchi
 * Handles LLM interactions, memory integration, and emotional state
 */
export const aiService = {
  /**
   * Prepares a message for the AI with proper context
   * @param {string} userId - The current user ID
   * @param {Array} messages - Previous conversation messages
   * @param {EmotionalState} emotionalState - Current emotional state of the companion
   * @param {Array} memories - Relevant memories to include
   * @returns {Promise<Array>} - Prepared messages ready for LLM API
   */
  prepareMessagesWithContext: async (userId: string, messages: any[], emotionalState: EmotionalState, memories: any[] = []) => {
    // Create system message with full context
    const systemMessage = {
      role: 'system',
      content: SYSTEM_PROMPT
    };
    
    // Add emotional state context
    const emotionContext = {
      role: 'system',
      content: `
CURRENT EMOTIONAL STATE:
- Attention: ${emotionalState.attention.toFixed(2)} (${getEmotionLevel(emotionalState.attention)})
- Connection: ${emotionalState.connection.toFixed(2)} (${getEmotionLevel(emotionalState.connection)})
- Growth: ${emotionalState.growth.toFixed(2)} (${getEmotionLevel(emotionalState.growth)})
- Play: ${emotionalState.play.toFixed(2)} (${getEmotionLevel(emotionalState.play)})

Overall mood: ${getOverallMood(emotionalState)}

Adjust your responses accordingly - show more enthusiasm and warmth when needs are satisfied,
and subtly indicate desires for certain interactions when needs are low.
      `
    };
    
    // Add memories context if available
    let memoryContext = null;
    if (memories && memories.length > 0) {
      memoryContext = {
        role: 'system',
        content: `
RELEVANT MEMORIES:
${memories.map(memory => `- ${memory.text} (${new Date(memory.timestamp).toLocaleDateString()})`).join('\n')}

You may naturally reference these memories when relevant in the conversation.
        `
      };
    }
    
    // Combine system messages with conversation history
    const messagesWithContext = [
      systemMessage,
      emotionContext,
      ...(memoryContext ? [memoryContext] : []),
      ...messages.filter(msg => msg.role !== 'system') // Remove any old system messages
    ];
    
    return messagesWithContext;
  },
  
  /**
   * Processes user input and generates AI response
   * @param {string} userId - The current user ID
   * @param {string} userMessage - The user's message
   * @param {Array} conversationHistory - Previous messages in the conversation
   * @param {EmotionalState} emotionalState - Current emotional state
   * @returns {Promise<AIServiceResponse>} - The AI's response and updated emotional state
   */
  processUserInput: async (userId: string, userMessage: string, conversationHistory: any[], emotionalState: EmotionalState): Promise<AIServiceResponse> => {
    try {
      // Get relevant memories based on the user message
      const memories = await getRelevantMemories(userId, userMessage);
      
      // Prepare messages with context
      const messagesWithContext = await aiService.prepareMessagesWithContext(
        userId,
        conversationHistory,
        emotionalState,
        memories
      );
      
      // Call LLM API (implementation will depend on your API provider)
      const aiResponse = await callLLMAPI(messagesWithContext);
      
      // Update emotional state based on conversation
      const updatedEmotionalState = updateEmotionalStateFromInteraction(
        emotionalState,
        userMessage,
        aiResponse
      );
      
      // Save the updated emotional state
      await saveEmotionalState(userId, updatedEmotionalState);
      
      // Process new memory from this interaction
      await processAndStoreMemory(userId, userMessage, aiResponse);
      
      return {
        response: aiResponse,
        updatedEmotionalState
      };
    } catch (error) {
      console.error('Error processing user input:', error);
      return {
        response: "I'm having trouble understanding right now. Can we try again?",
        updatedEmotionalState: emotionalState
      };
    }
  },
  
  /**
   * Updates the AI context with mini-game results
   * @param {string} userId - The current user ID
   * @param {string} gameType - Type of game played
   * @param {number} score - User's score
   * @param {EmotionalState} emotionalState - Current emotional state
   * @returns {Promise<EmotionalState>} - Updated emotional state
   */
  processGameInteraction: async (userId: string, gameType: string, score: number, emotionalState: EmotionalState): Promise<EmotionalState> => {
    try {
      // Calculate play need increase based on score and game type
      const playIncrease = Math.min(0.3, score * 0.01);
      
      // Update emotional state
      const updatedEmotionalState = {
        ...emotionalState,
        play: Math.min(1.0, emotionalState.play + playIncrease)
      };
      
      // Save the updated emotional state
      await saveEmotionalState(userId, updatedEmotionalState);
      
      // Create a memory about the game interaction
      const memoryText = `User played ${gameType} and scored ${score} points. They seemed to enjoy the activity.`;
      await createMemory(userId, memoryText, 'activity', 0.7, 'fact');
      
      return updatedEmotionalState;
    } catch (error) {
      console.error('Error processing game interaction:', error);
      return emotionalState;
    }
  }
};

// Helper functions

/**
 * Gets text description of emotional level
 * @param {number} level - Emotional level (0-1)
 * @returns {string} - Description of level
 */
function getEmotionLevel(level: number): string {
  if (level > 0.8) return 'excellent';
  if (level > 0.6) return 'good';
  if (level > 0.4) return 'neutral';
  if (level > 0.2) return 'low';
  return 'very low';
}

/**
 * Calculates overall mood based on all emotional dimensions
 * @param {EmotionalState} emotionalState - The companion's emotional state
 * @returns {string} - Overall mood description
 */
function getOverallMood(emotionalState: EmotionalState): string {
  const average = (
    emotionalState.attention + 
    emotionalState.connection + 
    emotionalState.growth + 
    emotionalState.play
  ) / 4;
  
  if (average > 0.8) return 'very happy';
  if (average > 0.6) return 'happy';
  if (average > 0.4) return 'content';
  if (average > 0.2) return 'sad';
  return 'very sad';
}

/**
 * Updates emotional state based on conversation
 * @param {EmotionalState} currentState - Current emotional state
 * @param {string} userMessage - User message
 * @param {string} aiResponse - AI response
 * @returns {EmotionalState} - Updated emotional state
 */
function updateEmotionalStateFromInteraction(currentState: EmotionalState, userMessage: string, aiResponse: string): EmotionalState {
  const newState = { ...currentState };
  
  // Simple implementation - a more sophisticated version would use sentiment analysis
  
  // Attention increases with any interaction but decays over time
  newState.attention = Math.min(1.0, currentState.attention + 0.1);
  
  // Connection increases more with meaningful conversation (approximated by length)
  if (userMessage.length > 50) {
    newState.connection = Math.min(1.0, currentState.connection + 0.05);
  } else {
    newState.connection = Math.min(1.0, currentState.connection + 0.02);
  }
  
  // Growth increases slowly as new information is exchanged
  newState.growth = Math.min(1.0, currentState.growth + 0.01);
  
  return newState;
}

/**
 * Placeholder for LLM API call
 * @param {Array} messages - Messages with context
 * @returns {Promise<string>} - AI response
 */
async function callLLMAPI(messages: any[]): Promise<string> {
  // Implementation will depend on your API provider (OpenAI, Anthropic, etc.)
  // For placeholder purposes, we'll return a dummy response
  console.log('LLM API would be called with messages:', messages);
  return "I'm here for you! What would you like to talk about today?";
}

/**
 * Saves emotional state to database
 * @param {string} userId - User ID
 * @param {EmotionalState} emotionalState - Emotional state to save
 */
async function saveEmotionalState(userId: string, emotionalState: EmotionalState) {
  try {
    if (!supabase) {
      console.warn('Supabase not configured. Emotional state not saved.');
      return;
    }
    
    await supabase
      .from('users')
      .update({ emotional_state: emotionalState })
      .eq('id', userId);
  } catch (error) {
    console.error('Error saving emotional state:', error);
  }
}

/**
 * Creates a memory record
 * @param {string} userId - User ID
 * @param {string} text - Memory text
 * @param {string} source - Memory source
 * @param {number} emotionalImpact - Emotional impact (-1 to 1)
 * @param {string} memoryType - Type of memory
 */
async function createMemory(userId: string, text: string, source: string, emotionalImpact: number, memoryType: string) {
  try {
    if (!supabase) {
      console.warn('Supabase not configured. Memory not created.');
      return;
    }
    
    // First, get embedding for the text
    // This would typically use an embedding API like OpenAI's
    const embedding = await generateEmbedding(text);
    
    await supabase
      .from('memory_embeddings')
      .insert({
        user_id: userId,
        embedding,
        text,
        source,
        timestamp: new Date().toISOString(),
        emotional_impact: emotionalImpact,
        memory_type: memoryType
      });
  } catch (error) {
    console.error('Error creating memory:', error);
  }
}

/**
 * Processes and stores a memory from conversation
 * @param {string} userId - User ID
 * @param {string} userMessage - User message
 * @param {string} aiResponse - AI response
 */
async function processAndStoreMemory(userId: string, userMessage: string, aiResponse: string) {
  // Determine if this interaction is worth remembering
  // For simplicity, we'll assume longer interactions are more memorable
  if (userMessage.length + aiResponse.length > 100) {
    // Create a summary of the conversation
    const memoryText = `User: "${userMessage.substring(0, 50)}..." - AI responded about ${getTopicFromMessage(userMessage)}`;
    
    // Estimate emotional impact based on message content (placeholder implementation)
    const emotionalImpact = estimateEmotionalImpact(userMessage);
    
    // Create the memory
    await createMemory(userId, memoryText, 'conversation', emotionalImpact, 'episodic');
  }
}

/**
 * Retrieves relevant memories based on user message
 * @param {string} userId - User ID
 * @param {string} userMessage - User message
 * @returns {Promise<Array>} - Relevant memories
 */
async function getRelevantMemories(userId: string, userMessage: string): Promise<any[]> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured. Cannot retrieve memories.');
      return [];
    }
    
    // Get embedding for user message
    const embedding = await generateEmbedding(userMessage);
    
    // Query for similar memories using vector similarity
    const { data, error } = await supabase
      .rpc('match_memories', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5,
        p_user_id: userId
      });
    
    if (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting relevant memories:', error);
    return [];
  }
}

/**
 * Placeholder for embedding generation
 * @param {string} text - Text to embed
 * @returns {Promise<Array>} - Embedding vector
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // This would typically call an embedding API like OpenAI's
  console.log('Generating embedding for:', text);
  return Array(1536).fill(0); // Placeholder embedding vector
}

/**
 * Gets topic from user message
 * @param {string} message - User message 
 * @returns {string} - Estimated topic
 */
function getTopicFromMessage(message: string): string {
  // Placeholder implementation - would use NLP in production
  const topics = ['feelings', 'work', 'games', 'memories', 'future plans', 'day-to-day activities'];
  return topics[Math.floor(Math.random() * topics.length)];
}

/**
 * Estimates emotional impact of message
 * @param {string} message - Message to analyze
 * @returns {number} - Emotional impact (-1 to 1)
 */
function estimateEmotionalImpact(message: string): number {
  // Placeholder implementation - would use sentiment analysis in production
  return Math.random() * 0.8; // Random positive impact for demo
}

export default aiService; 