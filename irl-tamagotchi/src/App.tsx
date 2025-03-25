import React, { useState, useEffect } from 'react';
import { CompanionProvider } from './context/CompanionContext';
import CompanionAvatar from './components/CompanionAvatar';
import ChatInterface from './components/ChatInterface';
import MemoriesDisplay from './components/MemoriesDisplay';
import MiniGameContainer from './components/MiniGameContainer';
import StreakTracker from './components/StreakTracker';
import { createClient } from '@supabase/supabase-js';
import { Tamagotchi } from './types';

// Check if Supabase credentials are properly set
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const hasSupabaseConfig = 
  !!supabaseUrl && 
  !!supabaseKey && 
  supabaseUrl !== 'https://example.supabase.co' && 
  supabaseKey !== 'your_supabase_anon_key';

// Create Supabase client only if credentials are valid
const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

function App() {
  const [tamagotchi, setTamagotchi] = useState<Tamagotchi>({
    name: 'GPTamagotchi',
    mood: 'happy',
    energy: 100,
    hunger: 100,
    social: 100,
    hygiene: 100,
    fun: 100,
    lastInteractionAt: new Date().toISOString(),
  });

  // Initialize Tamagotchi state
  useEffect(() => {
    const fetchTamagotchi = async () => {
      if (!hasSupabaseConfig || !supabase) {
        console.warn('Supabase not configured. Using local Tamagotchi state only.');
        return;
      }

      try {
        const { data, error } = await supabase.from('tamagotchis').select('*').eq('id', 1).single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setTamagotchi(data);
        }
      } catch (error) {
        console.error('Error fetching tamagotchi:', error);
      }
    };

    fetchTamagotchi();
  }, []);

  // Save Tamagotchi state to Supabase
  const saveTamagotchi = async (updatedTamagotchi: Tamagotchi) => {
    if (!hasSupabaseConfig || !supabase) {
      console.warn('Supabase not configured. Changes will not persist after reload.');
      return;
    }

    try {
      const { error } = await supabase
        .from('tamagotchis')
        .upsert({ id: 1, ...updatedTamagotchi });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error saving tamagotchi:', error);
    }
  };

  return (
    <CompanionProvider>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-indigo-600 text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">GPTamagotchi</h1>
            <p className="text-indigo-200">Your evolving AI companion</p>
          </div>
        </header>
        
        <main className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - Avatar */}
            <div className="md:col-span-1">
              <CompanionAvatar className="mb-8" />
              
              {/* Time and streak info */}
              <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                <div className="text-center mb-4">
                  <p className="text-gray-600">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <StreakTracker />
              </div>
              
              {/* Mini-games */}
              <MiniGameContainer className="mb-8" />
            </div>
            
            {/* Center and right columns - Chat and Memories */}
            <div className="md:col-span-2">
              <ChatInterface className="mb-8 h-[500px]" />
              <MemoriesDisplay />
            </div>
          </div>
        </main>
        
        <footer className="bg-gray-200 p-4 mt-8">
          <div className="container mx-auto text-center text-gray-600 text-sm">
            <p>GPTamagotchi MVP - Your emotional AI companion</p>
          </div>
        </footer>
      </div>
    </CompanionProvider>
  );
}

export default App; 