import React from 'react';
import { useCompanion } from '../context/CompanionContext';

interface CompanionAvatarProps {
  className?: string;
}

const CompanionAvatar: React.FC<CompanionAvatarProps> = ({ className = '' }) => {
  const { companionState } = useCompanion();
  const { emotionalState, isThinking, isListening, isSpeaking } = companionState;
  
  // Calculate overall mood from emotional state
  const getMoodLevel = () => {
    const overallMood = (
      emotionalState.attention + 
      emotionalState.connection + 
      emotionalState.growth + 
      emotionalState.play
    ) / 4;
    
    if (overallMood > 0.8) return 'excellent';
    if (overallMood > 0.6) return 'good';
    if (overallMood > 0.4) return 'neutral';
    if (overallMood > 0.2) return 'poor';
    return 'bad';
  };
  
  // Get avatar state based on companion state
  const getAvatarState = () => {
    if (isListening) return 'listening';
    if (isThinking) return 'thinking';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };
  
  // Get animation class based on avatar state
  const getAnimationClass = () => {
    const state = getAvatarState();
    
    switch (state) {
      case 'listening':
        return 'animate-pulse';
      case 'thinking':
        return 'animate-bounce';
      case 'speaking':
        return 'animate-wiggle';
      default:
        return 'animate-breathe';
    }
  };
  
  // Get color based on mood
  const getMoodColor = () => {
    const mood = getMoodLevel();
    
    switch (mood) {
      case 'excellent':
        return 'bg-indigo-500';
      case 'good':
        return 'bg-blue-500';
      case 'neutral':
        return 'bg-teal-500';
      case 'poor':
        return 'bg-amber-500';
      case 'bad':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Avatar circle */}
      <div 
        className={`
          w-40 h-40 rounded-full 
          ${getMoodColor()} 
          ${getAnimationClass()}
          flex items-center justify-center
          shadow-lg
          transition-all duration-500
        `}
      >
        {/* Emotional expression - simple representation */}
        <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden">
          {/* Eyes */}
          <div className="absolute flex space-x-8 top-6">
            <div className="w-3 h-3 rounded-full bg-black"></div>
            <div className="w-3 h-3 rounded-full bg-black"></div>
          </div>
          
          {/* Mouth based on mood */}
          <div className="absolute bottom-6">
            {getMoodLevel() === 'excellent' && (
              <div className="w-12 h-6 rounded-b-full border-2 border-black border-t-0"></div>
            )}
            {getMoodLevel() === 'good' && (
              <div className="w-8 h-3 rounded-b-full border-2 border-black border-t-0"></div>
            )}
            {getMoodLevel() === 'neutral' && (
              <div className="w-8 h-0.5 bg-black"></div>
            )}
            {getMoodLevel() === 'poor' && (
              <div className="w-8 h-3 rounded-t-full border-2 border-black border-b-0"></div>
            )}
            {getMoodLevel() === 'bad' && (
              <div className="w-12 h-6 rounded-t-full border-2 border-black border-b-0"></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status text */}
      <div className="mt-4 text-center">
        <p className="text-lg font-medium">
          {isListening && "Listening..."}
          {isThinking && "Thinking..."}
          {isSpeaking && "Speaking..."}
          {!isListening && !isThinking && !isSpeaking && "Idle"}
        </p>
      </div>
      
      {/* Needs indicators */}
      <div className="mt-6 w-full max-w-sm grid grid-cols-2 gap-2">
        <NeedIndicator label="Attention" value={emotionalState.attention} />
        <NeedIndicator label="Connection" value={emotionalState.connection} />
        <NeedIndicator label="Growth" value={emotionalState.growth} />
        <NeedIndicator label="Play" value={emotionalState.play} />
      </div>
    </div>
  );
};

interface NeedIndicatorProps {
  label: string;
  value: number;
}

const NeedIndicator: React.FC<NeedIndicatorProps> = ({ label, value }) => {
  // Get color class based on value
  const getColorClass = () => {
    if (value > 0.7) return 'bg-green-500';
    if (value > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColorClass()} transition-all duration-500`} 
          style={{ width: `${value * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CompanionAvatar; 