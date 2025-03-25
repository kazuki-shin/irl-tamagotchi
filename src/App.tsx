import React from 'react';
import { CompanionProvider } from './context/CompanionContext';
import CompanionAvatar from './components/CompanionAvatar';
import ChatInterface from './components/ChatInterface';
import MemoriesDisplay from './components/MemoriesDisplay';

function App() {
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
                <div className="text-center">
                  <p className="text-gray-600">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <p className="text-sm text-gray-500">Companion active for 1 day</p>
                </div>
              </div>
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