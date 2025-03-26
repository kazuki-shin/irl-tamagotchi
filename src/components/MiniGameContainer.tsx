import aiService from '../services/ai-service';

// ... existing code ...

  // Function to handle game completion
  const handleGameEnd = async (score: number) => {
    try {
      // Update games played count
      const newGamesPlayed = gamesPlayedToday + 1;
      setGamesPlayedToday(newGamesPlayed);
      localStorage.setItem('gamesPlayedToday', newGamesPlayed.toString());
      
      // Process game interaction with AI service
      const updatedEmotionalState = await aiService.processGameInteraction(
        userId,
        'Bubble Pop',
        score,
        companionState.emotionalState
      );
      
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