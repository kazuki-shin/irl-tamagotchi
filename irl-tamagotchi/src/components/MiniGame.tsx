import React, { useState, useEffect } from 'react';
import { useCompanion } from '../context/CompanionContext';

interface MiniGameProps {
  onGameEnd: (score: number) => void;
  className?: string;
}

const MiniGame: React.FC<MiniGameProps> = ({ onGameEnd, className = '' }) => {
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  // Start the game
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(30);
    // Generate initial targets
    generateTargets();
  };
  
  // Generate random targets on the game board
  const generateTargets = () => {
    const newTargets = [];
    for (let i = 0; i < 3; i++) {
      newTargets.push({
        id: Math.random(),
        x: Math.floor(Math.random() * 80) + 10, // Between 10-90% of the container width
        y: Math.floor(Math.random() * 80) + 10, // Between 10-90% of the container height
      });
    }
    setTargets(newTargets);
  };
  
  // Handle clicking on a target
  const handleTargetClick = (targetId: number) => {
    // Remove the clicked target
    setTargets(targets.filter(target => target.id !== targetId));
    
    // Increase score
    setScore(score + 1);
    
    // Generate a new target to replace the clicked one
    const newTarget = {
      id: Math.random(),
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 80) + 10,
    };
    
    setTargets(prev => [...prev, newTarget]);
  };
  
  // Game timer
  useEffect(() => {
    if (gameActive && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameActive(false);
            setGameOver(true);
            onGameEnd(score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameActive, gameOver, score, onGameEnd]);
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Bubble Pop</h2>
      
      {!gameActive && !gameOver ? (
        <div className="text-center py-10">
          <p className="mb-6">Click on the bubbles as quickly as possible within 30 seconds!</p>
          <button 
            onClick={startGame}
            className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            Start Game
          </button>
        </div>
      ) : gameActive ? (
        <div>
          <div className="flex justify-between mb-4">
            <div className="text-lg">Score: {score}</div>
            <div className="text-lg">Time: {timeLeft}s</div>
          </div>
          
          <div className="relative w-full h-80 bg-indigo-50 rounded-md overflow-hidden">
            {targets.map(target => (
              <div
                key={target.id}
                className="absolute w-10 h-10 rounded-full bg-indigo-400 hover:bg-indigo-500 cursor-pointer transform transition-transform hover:scale-110 flex items-center justify-center text-white font-bold"
                style={{ left: `${target.x}%`, top: `${target.y}%`, marginLeft: '-20px', marginTop: '-20px' }}
                onClick={() => handleTargetClick(target.id)}
              >
                Pop!
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-2xl font-bold mb-4">Game Over!</h3>
          <p className="text-lg mb-6">Your score: {score}</p>
          <button 
            onClick={startGame}
            className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default MiniGame; 