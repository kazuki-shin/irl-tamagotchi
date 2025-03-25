import React, { useState, useEffect } from 'react';
import { useCompanion } from '../context/CompanionContext';

interface StreakTrackerProps {
  className?: string;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({ className = '' }) => {
  const { userId } = useCompanion();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastLogin, setLastLogin] = useState<Date | null>(null);
  const [daysActive, setDaysActive] = useState(0);
  
  useEffect(() => {
    // Load streak data from localStorage
    const loadStreakData = () => {
      const storedLastLogin = localStorage.getItem('lastLogin');
      const storedStreak = localStorage.getItem('currentStreak');
      const storedDaysActive = localStorage.getItem('daysActive');
      
      if (storedLastLogin) {
        setLastLogin(new Date(storedLastLogin));
      }
      
      if (storedStreak) {
        setCurrentStreak(parseInt(storedStreak));
      }
      
      if (storedDaysActive) {
        setDaysActive(parseInt(storedDaysActive));
      }
    };
    
    // Update streak based on last login
    const updateStreak = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day
      
      if (!lastLogin) {
        // First login
        setCurrentStreak(1);
        setDaysActive(1);
        
        // Save to localStorage
        localStorage.setItem('lastLogin', today.toISOString());
        localStorage.setItem('currentStreak', '1');
        localStorage.setItem('daysActive', '1');
        return;
      }
      
      const lastLoginDate = new Date(lastLogin);
      lastLoginDate.setHours(0, 0, 0, 0); // Reset to start of day
      
      // Calculate the difference in days
      const timeDiff = today.getTime() - lastLoginDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff === 0) {
        // Already logged in today, do nothing
        return;
      } else if (daysDiff === 1) {
        // Consecutive day, increase streak
        const newStreak = currentStreak + 1;
        const newDaysActive = daysActive + 1;
        
        setCurrentStreak(newStreak);
        setDaysActive(newDaysActive);
        
        // Save to localStorage
        localStorage.setItem('lastLogin', today.toISOString());
        localStorage.setItem('currentStreak', newStreak.toString());
        localStorage.setItem('daysActive', newDaysActive.toString());
      } else {
        // Streak broken
        setCurrentStreak(1);
        const newDaysActive = daysActive + 1;
        setDaysActive(newDaysActive);
        
        // Save to localStorage
        localStorage.setItem('lastLogin', today.toISOString());
        localStorage.setItem('currentStreak', '1');
        localStorage.setItem('daysActive', newDaysActive.toString());
      }
    };
    
    loadStreakData();
    updateStreak();
    
    // In a real implementation, save to database too
  }, [lastLogin, currentStreak, daysActive, userId]);
  
  // Render streak indicator
  const renderStreakIndicator = () => {
    // Generate last 7 days with active/inactive state
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Check if this date is part of the streak
      let isActive = false;
      
      if (lastLogin) {
        const lastLoginDate = new Date(lastLogin);
        lastLoginDate.setHours(0, 0, 0, 0);
        
        // If we're showing today and we've logged in
        if (i === 0) {
          isActive = true;
        } 
        // If we're showing a previous day and it's part of the streak
        else if (currentStreak > 1) {
          const dayDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24));
          isActive = dayDiff < currentStreak;
        }
      }
      
      days.push({ 
        date,
        isActive
      });
    }
    
    return (
      <div className="flex justify-between items-center mt-2">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-xs text-gray-500">
              {day.date.toLocaleDateString(undefined, { weekday: 'short' }).charAt(0)}
            </div>
            <div 
              className={`w-4 h-4 rounded-full mt-1 ${
                day.isActive ? 'bg-green-500' : 'bg-gray-200'
              }`}
            ></div>
          </div>
        ))}
      </div>
    );
  };
  
  // Get streak message
  const getStreakMessage = () => {
    if (currentStreak < 3) {
      return "Keep coming back to build your streak!";
    } else if (currentStreak < 7) {
      return "Great streak! Keep it up!";
    } else if (currentStreak < 14) {
      return "Impressive streak! You're doing great!";
    } else {
      return "Amazing streak! You're a GPTamagotchi master!";
    }
  };
  
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-semibold">{currentStreak}</span>
          <span className="text-gray-600 ml-1">day streak</span>
        </div>
        <div className="text-sm text-gray-500">
          {daysActive} days active
        </div>
      </div>
      
      {renderStreakIndicator()}
      
      <div className="mt-2 text-xs text-indigo-600">
        {getStreakMessage()}
      </div>
    </div>
  );
};

export default StreakTracker; 