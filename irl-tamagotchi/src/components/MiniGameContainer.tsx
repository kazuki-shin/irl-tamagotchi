import React, { useState } from 'react';
import { useCompanion } from '../context/CompanionContext';
import MiniGame from './MiniGame';
import AchievementModal from './AchievementModal';

interface MiniGameContainerProps {
  className?: string;
}

const MiniGameContainer: React.FC<MiniGameContainerProps> = ({ className = '' }) => {
  const { companionState, userId } = useCompanion();
  const [showGames, setShowGames] = useState(false);
  const [gamesPlayedToday, setGamesPlayedToday] = useState<number>(
    parseInt(localStorage.getItem('gamesPlayedToday') || '0')
  );
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState({
    title: '',
    description: '',
    icon: '🏆'
  });
  
  const maxGamesPerDay = 5;
  
  // Function to handle game completion
  const handleGameEnd = async (score: number) => {
    try {
      // Update games played count
      const newGamesPlayed = gamesPlayedToday + 1;
      setGamesPlayedToday(newGamesPlayed);
      localStorage.setItem('gamesPlayedToday', newGamesPlayed.toString());
      
      // Calculate play need increase based on score (higher score = more play need satisfied)
      const playNeedIncrease = Math.min(0.3, score * 0.01);
      
      // In a real implementation, we would update the play need in the database
      console.log(`Increased play need by ${playNeedIncrease.toFixed(2)}`);
      
      // Show achievement if score is high
      if (score >= 20) {
        setAchievementData({
          title: 'Bubble Master!',
          description: `You popped ${score} bubbles! Your companion feels extremely playful now.`,
          icon: '🎮'
        });
        setShowAchievement(true);
      } else if (score >= 10) {
        setAchievementData({
          title: 'Bubble Enthusiast',
          description: `You popped ${score} bubbles! Your companion is enjoying playtime.`,
          icon: '🎯'
        });
        setShowAchievement(true);
      }
      
      // Add a timeout before allowing another game
      setTimeout(() => {
        // If we've reached max games, don't show games anymore
        if (newGamesPlayed >= maxGamesPerDay) {
          setShowGames(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Error updating play need:', error);
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Games</h2>
      
      {!showGames ? (
        <div className="text-center py-4">
          <p className="mb-2">
            Playing games will increase your companion's play need satisfaction.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Games played today: {gamesPlayedToday}/{maxGamesPerDay}
          </p>
          
          {gamesPlayedToday < maxGamesPerDay ? (
            <button
              onClick={() => setShowGames(true)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
            >
              Play a Game
            </button>
          ) : (
            <p className="text-amber-500">
              You've played all available games for today. Come back tomorrow for more!
            </p>
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setShowGames(false)}
            className="mb-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            ← Back to Games
          </button>
          
          <MiniGame onGameEnd={handleGameEnd} />
        </div>
      )}
      
      {/* Achievement Modal */}
      <AchievementModal
        isOpen={showAchievement}
        onClose={() => setShowAchievement(false)}
        title={achievementData.title}
        description={achievementData.description}
        icon={achievementData.icon}
      />
    </div>
  );
};

export default MiniGameContainer; 