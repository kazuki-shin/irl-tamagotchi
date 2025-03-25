import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useCompanion } from '../context/CompanionContext';
import { Memory } from '../types';

// Utility functions
const getEmotionColor = (emotionalImpact: number) => {
  if (emotionalImpact > 0.7) return 'border-indigo-500 bg-indigo-50';
  if (emotionalImpact > 0.5) return 'border-blue-500 bg-blue-50';
  if (emotionalImpact > 0.3) return 'border-teal-500 bg-teal-50';
  if (emotionalImpact > 0) return 'border-green-500 bg-green-50';
  if (emotionalImpact > -0.3) return 'border-yellow-500 bg-yellow-50';
  if (emotionalImpact > -0.5) return 'border-orange-500 bg-orange-50';
  return 'border-red-500 bg-red-50';
};

// Get icon based on memory type
const getMemoryIcon = (memoryType: string) => {
  switch (memoryType) {
    case 'episodic': return '💬';
    case 'summary': return '📝';
    case 'fact': return '📌';
    case 'pattern': return '🔄';
    default: return '💭';
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

interface MemoriesDisplayProps {
  className?: string;
}

const MemoriesDisplay: React.FC<MemoriesDisplayProps> = ({ className = '' }) => {
  const { userId } = useCompanion();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchMemories = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      
      try {
        if (!supabase) {
          console.warn('Supabase not configured. Cannot fetch memories.');
          setMemories([]);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('memory_embeddings')
          .select('*')
          .eq('user_id', userId)
          .order('emotional_impact', { ascending: false })
          .limit(8);
          
        if (error) {
          throw error;
        }
        
        setMemories(data || []);
      } catch (error) {
        console.error('Error fetching memories:', error);
        setMemories([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMemories();
  }, [userId]);
  
  // Truncate text if too long
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Memories</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No memories collected yet.</p>
          <p className="text-sm mt-2">Interact with your companion to create memories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      )}
    </div>
  );
};

interface MemoryCardProps {
  memory: Memory;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory }) => {
  const [expanded, setExpanded] = useState(false);
  
  const handleClick = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div 
      className={`
        p-3 rounded-lg border-2 cursor-pointer transition-all duration-300
        ${getEmotionColor(memory.emotional_impact)}
        ${expanded ? 'shadow-md' : 'shadow-sm hover:shadow'}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="text-2xl mr-3">
          {getMemoryIcon(memory.memory_type)}
        </div>
        <div className="flex-1">
          <p className={`text-gray-800 ${expanded ? '' : 'line-clamp-2'}`}>
            {memory.text}
          </p>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>{formatDate(memory.timestamp)}</span>
            <span className="capitalize">{memory.memory_type}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoriesDisplay; 