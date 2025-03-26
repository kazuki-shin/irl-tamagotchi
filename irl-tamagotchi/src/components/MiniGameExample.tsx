import React, { useState } from 'react';
import { useCompanion } from '../context/CompanionContext';
import aiService from '../services/ai-service';

interface MiniGameExampleProps {
  className?: string;
}

/**
 * Example mini-game component showing AI service integration
 */
const MiniGameExample: React.FC<MiniGameExampleProps> = ({ className = '' }) => {
  const { companionState, userId } = useCompanion();
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameResult, setGameResult] = useState('');
  
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setGameResult('');
  };
  
  const endGame = async () => {
    setGameActive(false);
    
    try {
      // Record the game result with the AI service
      const updatedEmotionalState = await aiService.processGameInteraction(
        userId,
        'Example Game',
        score,
        companionState.emotionalState
      );
      
      // Show feedback about the emotional state change
      if (updatedEmotionalState.play > companionState.emotionalState.play) {
        const increase = (updatedEmotionalState.play - companionState.emotionalState.play) * 100;
        setGameResult(`Your companion's play need increased by ${increase.toFixed(0)}%! They're feeling happier now.`);
      }
    } catch (error) {
      console.error('Error processing game result:', error);
      setGameResult('Something went wrong while updating your companion.');
    }
  };
  
  const increaseScore = () => {
    setScore(prev => prev + 1);
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Example Mini-Game</h2>
      
      {!gameActive ? (
        <div className="text-center">
          {gameResult && (
            <div className="mb-4 p-3 bg-indigo-50 text-indigo-800 rounded-md">
              {gameResult}
            </div>
          )}
          
          <p className="mb-4">Play this simple game to increase your companion's play need!</p>
          <button
            onClick={startGame}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Start Game
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <p className="text-2xl font-bold">Score: {score}</p>
          </div>
          
          <div className="mb-6">
            <button
              onClick={increaseScore}
              className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 text-xl"
            >
              Click Me!
            </button>
          </div>
          
          <button
            onClick={endGame}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            End Game
          </button>
        </div>
      )}
    </div>
  );
};

export default MiniGameExample; 