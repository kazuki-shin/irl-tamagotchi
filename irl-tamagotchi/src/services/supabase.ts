import { createClient } from '@supabase/supabase-js';

// Check if Supabase credentials are properly set
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const hasSupabaseConfig = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'https://example.supabase.co' && 
  supabaseAnonKey !== 'your_supabase_anon_key';

// Create Supabase client only if credentials are valid
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl || '', supabaseAnonKey || '')
  : null;

// User related functions
export const createUser = async (userId: string) => {
  if (!hasSupabaseConfig || !supabase) {
    console.warn('Supabase not configured. User creation skipped.');
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        id: userId,
        created_at: new Date().toISOString(),
        personality_settings: {},
        emotional_state: {
          attention: 1.0,
          connection: 1.0,
          growth: 1.0,
          play: 1.0
        }
      }
    ]);
  
  return { data, error };
};

// Conversation related functions
export const saveConversation = async (userId: string, role: 'user' | 'assistant', text: string) => {
  if (!hasSupabaseConfig || !supabase) {
    console.warn('Supabase not configured. Conversation not saved.');
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert([
      {
        user_id: userId,
        timestamp: new Date().toISOString(),
        role,
        text,
        importance_marker: 0 // Default importance
      }
    ]);
  
  return { data, error };
};

// Memory related functions
export const saveMemoryEmbedding = async (
  userId: string, 
  embedding: number[], 
  text: string, 
  source: 'conversation' | 'summary' | 'core_memory' | 'emotion_pattern' = 'conversation',
  memoryType: 'episodic' | 'summary' | 'fact' | 'pattern' = 'episodic',
  emotionalImpact: number = 0
) => {
  if (!hasSupabaseConfig || !supabase) {
    console.warn('Supabase not configured. Memory embedding not saved.');
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('memory_embeddings')
    .insert([
      {
        user_id: userId,
        embedding,
        text,
        source,
        timestamp: new Date().toISOString(),
        emotional_impact: emotionalImpact,
        memory_type: memoryType
      }
    ]);
  
  return { data, error };
};

export const getSimilarMemories = async (userId: string, embedding: number[], limit: number = 5) => {
  if (!hasSupabaseConfig || !supabase) {
    console.warn('Supabase not configured. Returning empty memories array.');
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .rpc('match_memories', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
      p_user_id: userId
    });
  
  return { data, error };
};

// Emotional state functions
export const updateEmotionalState = async (userId: string, emotionalState: Record<string, number>) => {
  if (!hasSupabaseConfig || !supabase) {
    console.warn('Supabase not configured. Emotional state not updated.');
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .update({ emotional_state: emotionalState })
    .eq('id', userId);
  
  return { data, error };
};

// Engagement metrics functions
export const updateLastInteraction = async (userId: string, streakCount: number) => {
  if (!hasSupabaseConfig || !supabase) {
    console.warn('Supabase not configured. Engagement metrics not updated.');
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('engagement_metrics')
    .upsert([
      {
        user_id: userId,
        last_interaction: new Date().toISOString(),
        streak_count: streakCount
      }
    ]);
  
  return { data, error };
}; 