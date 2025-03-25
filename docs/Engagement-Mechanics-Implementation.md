# Engagement Mechanics Implementation Guide

This document outlines the specific implementation details for creating compelling engagement mechanics in the GPTamagotchi application, starting with the React + Tailwind MVP before eventually migrating to Unity WebGL.

## Implementation Phases

```
Phase 1: React + Tailwind MVP
Phase 2: Unity WebGL Migration
```

## Core Engagement Loop Architecture

![Engagement Loop Diagram](https://via.placeholder.com/800x400?text=Engagement+Loop+Diagram)

### Time-Based System (React Implementation)

```javascript
// Sample React implementation approach
const TimeManager = () => {
  const [lastLogin, setLastLogin] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  useEffect(() => {
    // Fetch last login from Supabase
    const fetchLastLogin = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('last_login, streak_count')
        .eq('id', currentUserId)
        .single();
      
      if (data) {
        setLastLogin(new Date(data.last_login));
        setCurrentStreak(data.streak_count);
        updateStreakCount(new Date(data.last_login), data.streak_count);
      }
    };
    
    fetchLastLogin();
    scheduleDailyEvents();
  }, []);
  
  const updateStreakCount = (lastLoginDate, streak) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastDate = new Date(lastLoginDate);
    lastDate.setHours(0, 0, 0, 0);
    
    let newStreak = streak;
    
    if (lastDate.getTime() === yesterday.getTime()) {
      newStreak++;
    } else if (lastDate.getTime() !== today.getTime()) {
      newStreak = 1; // Reset streak if missed a day
    }
    
    // Save updated streak to Supabase
    supabase
      .from('users')
      .update({ 
        streak_count: newStreak,
        last_login: new Date().toISOString()
      })
      .eq('id', currentUserId);
      
    setCurrentStreak(newStreak);
  };
  
  const scheduleDailyEvents = () => {
    const scheduleEvent = (eventName, scheduledTime) => {
      const now = new Date();
      const eventTime = new Date(scheduledTime);
      
      if (eventTime > now) {
        const timeUntilEvent = eventTime.getTime() - now.getTime();
        setTimeout(() => {
          triggerEvent(eventName);
        }, timeUntilEvent);
      }
    };
    
    // Schedule time-specific events based on user's local time
    const today = new Date();
    
    scheduleEvent("MorningGreeting", new Date(today.setHours(8, 0, 0, 0))); // 8:00 AM
    scheduleEvent("AfternoonCheck", new Date(today.setHours(14, 0, 0, 0))); // 2:00 PM
    scheduleEvent("EveningWrapup", new Date(today.setHours(21, 0, 0, 0))); // 9:00 PM
  };
  
  const triggerEvent = (eventName) => {
    // Handle scheduled events
    console.log(`Triggering event: ${eventName}`);
    // Update UI or trigger companion interaction
  };
  
  return (
    <div className="time-manager">
      {/* Time-aware UI elements */}
      <div className="streak-display">Current streak: {currentStreak} days</div>
    </div>
  );
};
```

### Unity Implementation (Future Phase)

```csharp
// Sample implementation approach for Unity migration
public class TimeManager : MonoBehaviour 
{
    [SerializeField] private bool useRealWorldTime = true;
    [SerializeField] private float dayNightCycleDuration = 24f; // hours in accelerated mode
    
    private DateTime lastLogin;
    private int currentStreak;
    
    void Start() 
    {
        lastLogin = GetLastLoginFromServer();
        UpdateStreakCount();
        ScheduleDailyEvents();
    }
    
    void UpdateStreakCount() 
    {
        DateTime today = DateTime.Now.Date;
        DateTime yesterday = today.AddDays(-1);
        
        if (lastLogin.Date == yesterday) {
            currentStreak++;
        } 
        else if (lastLogin.Date != today) {
            currentStreak = 1; // Reset streak if missed a day
        }
        
        SaveStreakToServer(currentStreak);
    }
    
    void ScheduleDailyEvents() 
    {
        // Schedule time-specific events based on user's local time
        ScheduleEvent("MorningGreeting", GetTimeToday(8, 0)); // 8:00 AM greeting
        ScheduleEvent("AfternoonCheck", GetTimeToday(14, 0)); // 2:00 PM check-in
        ScheduleEvent("EveningWrapup", GetTimeToday(21, 0)); // 9:00 PM wrap-up
    }
}
```

## Needs System Implementation

The needs system creates a sense of dependency and care without becoming burdensome or anxiety-inducing.

### Need Types & Decay Rates

| Need Type | Decay Rate | Visual Indicator | Satisfaction Method |
|-----------|------------|------------------|---------------------|
| Attention | -5% per day | UI elements become less vibrant | User presence and interaction |
| Connection | -10% per week | Character expressions become neutral | Deep conversations (20+ turns) |
| Growth | -15% per week | UI elements stop evolving | New topics, learning about user |  
| Play | -20% per 3 days | Interactive elements look unused | Mini-games, creative interactions |

### React Implementation

```javascript
// Sample React implementation
const NeedSystem = () => {
  const [needs, setNeeds] = useState({
    attention: 1.0,
    connection: 1.0,
    growth: 1.0,
    play: 1.0
  });
  
  const decayRates = {
    attention: 0.05, // 5% per day
    connection: 0.014, // ~10% per week
    growth: 0.021, // ~15% per week
    play: 0.067 // ~20% per 3 days
  };
  
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  
  useEffect(() => {
    // Load needs from Supabase
    const loadNeeds = async () => {
      const { data } = await supabase
        .from('users')
        .select('emotional_state')
        .eq('id', currentUserId)
        .single();
        
      if (data && data.emotional_state) {
        setNeeds(data.emotional_state);
        setLastUpdateTime(new Date(data.last_update_time || new Date()));
      }
    };
    
    loadNeeds();
    
    // Update needs on component mount and periodically
    updateNeeds();
    const interval = setInterval(updateNeeds, 3600000); // Update hourly
    
    return () => clearInterval(interval);
  }, []);
  
  const updateNeeds = () => {
    const now = new Date();
    const timeSinceLastUpdate = (now - new Date(lastUpdateTime)) / (1000 * 60 * 60 * 24); // In days
    
    if (timeSinceLastUpdate > 0) {
      const updatedNeeds = {...needs};
      
      // Apply decay based on days passed
      Object.keys(updatedNeeds).forEach(needType => {
        updatedNeeds[needType] = Math.max(0, updatedNeeds[needType] - (decayRates[needType] * timeSinceLastUpdate));
      });
      
      // Save to Supabase
      supabase
        .from('users')
        .update({ 
          emotional_state: updatedNeeds,
          last_update_time: now.toISOString()
        })
        .eq('id', currentUserId);
      
      setNeeds(updatedNeeds);
      setLastUpdateTime(now);
    }
  };
  
  const getOverallCareLevel = () => {
    const values = Object.values(needs);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };
  
  // Function to update UI based on need levels
  const getNeedUIClass = (needType) => {
    const level = needs[needType];
    if (level > 0.7) return "high";
    if (level > 0.3) return "medium";
    return "low";
  };
  
  return (
    <div className="needs-container">
      <div className={`need-indicator attention ${getNeedUIClass('attention')}`}>
        <span className="need-label">Attention</span>
        <div className="need-bar" style={{width: `${needs.attention * 100}%`}}></div>
      </div>
      
      {/* Similar indicators for other needs */}
      
      <div className="overall-care">
        Care Level: {Math.round(getOverallCareLevel() * 100)}%
      </div>
    </div>
  );
};
```

### Unity Implementation (Future Phase)

```csharp
[System.Serializable]
public class NeedSystem 
{
    [SerializeField] private float attentionLevel = 1.0f;
    [SerializeField] private float connectionLevel = 1.0f;
    [SerializeField] private float growthLevel = 1.0f;
    [SerializeField] private float playLevel = 1.0f;
    
    [SerializeField] private float attentionDecayRate = 0.05f;
    [SerializeField] private float connectionDecayRate = 0.014f; // ~10% per week
    [SerializeField] private float growthDecayRate = 0.021f; // ~15% per week
    [SerializeField] private float playDecayRate = 0.067f; // ~20% per 3 days
    
    private DateTime lastUpdateTime;
    
    public void UpdateNeeds() 
    {
        TimeSpan timeSinceLastUpdate = DateTime.Now - lastUpdateTime;
        int daysPassed = timeSinceLastUpdate.Days;
        
        // Apply decay based on days passed
        attentionLevel = Mathf.Max(0, attentionLevel - (attentionDecayRate * daysPassed));
        connectionLevel = Mathf.Max(0, connectionLevel - (connectionDecayRate * daysPassed));
        growthLevel = Mathf.Max(0, growthLevel - (growthDecayRate * daysPassed));
        playLevel = Mathf.Max(0, playLevel - (playDecayRate * daysPassed));
        
        // Update visuals based on need levels
        UpdateVisualState();
        
        lastUpdateTime = DateTime.Now;
    }
    
    public float GetOverallCareLevel() 
    {
        return (attentionLevel + connectionLevel + growthLevel + playLevel) / 4f;
    }
}
```

## Reward System Implementation

Rewards should be meaningful, visually appealing, and tied to user engagement patterns.

### Collectible Memories (React Implementation)

```javascript
const MemoryCollectible = ({ memory }) => {
  const [expanded, setExpanded] = useState(false);
  
  const handleClick = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div 
      className={`memory-collectible ${expanded ? 'expanded' : ''}`}
      onClick={handleClick}
      style={{
        // Visual styling based on emotional intensity
        borderColor: getEmotionColor(memory.emotionalIntensity),
        opacity: 0.5 + (memory.emotionalIntensity * 0.5)
      }}
    >
      <div className="memory-icon">
        <i className={getMemoryIcon(memory.type)}></i>
      </div>
      <div className="memory-date">{formatDate(memory.dateCreated)}</div>
      
      {expanded && (
        <div className="memory-details">
          <p className="memory-snippet">{memory.conversationSnippet}</p>
          <button className="replay-btn">Replay Memory</button>
        </div>
      )}
    </div>
  );
};

const MemoriesCollection = () => {
  const [memories, setMemories] = useState([]);
  
  useEffect(() => {
    // Fetch memories from Supabase
    const fetchMemories = async () => {
      const { data } = await supabase
        .from('memory_embeddings')
        .select('*')
        .eq('user_id', currentUserId)
        .order('emotional_impact', { ascending: false })
        .limit(20);
        
      if (data) {
        setMemories(data);
      }
    };
    
    fetchMemories();
  }, []);
  
  return (
    <div className="memories-container">
      <h2>Your Memories</h2>
      <div className="memories-grid">
        {memories.map(memory => (
          <MemoryCollectible key={memory.id} memory={memory} />
        ))}
      </div>
    </div>
  );
};
```

### Unity Implementation (Future Phase)

```csharp
public class MemoryCollectible 
{
    public string memoryId;
    public string conversationSnippet;
    public DateTime dateCreated;
    public float emotionalIntensity;
    public Vector3 positionInEnvironment;
    public GameObject memoryVisualPrefab;
    
    public void PlaceInEnvironment(Transform environment) 
    {
        // Instantiate visual representation
        // Add interaction handlers
    }
    
    public void OnInteract() 
    {
        // Display memory UI
        // Option to replay conversation
        // Show related memories
    }
}
```

### Unlockable Elements

| Milestone | React Implementation | Unity Implementation (Future) |
|-----------|---------------------|------------------------------|
| 3-day streak | Unlock new avatar accessory | Enable mesh renderer for accessory object |
| 7-day streak | Unlock UI theme variation | Load new environmental props and effects |
| 15 conversations | Unlock special chat effects | Add new animations to controller |
| 30-day relationship | Unlock new interaction options | Unlock UI elements and abilities |
| Seasonal events | Themed UI elements | Time-limited special content |

## Mini-Games & Interactive Elements (React Implementation)

```javascript
const MiniGameSelector = () => {
  const [availableGames, setAvailableGames] = useState([]);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(0);
  const maxGamesPerDay = 3;
  
  useEffect(() => {
    // Load game state from Supabase
    const loadGames = async () => {
      const { data: userData } = await supabase
        .from('users')
        .select('games_played_today, unlocked_features')
        .eq('id', currentUserId)
        .single();
        
      if (userData) {
        setGamesPlayedToday(userData.games_played_today || 0);
        
        // Filter available games based on unlocked features
        const unlockedFeatures = userData.unlocked_features || {};
        const games = [
          { id: 'memory_match', name: 'Memory Match', minLevel: 0 },
          { id: 'drawing_game', name: 'Creative Drawing', minLevel: 3 },
          { id: 'emotion_game', name: 'Emotion Detective', minLevel: 5 },
          { id: 'story_builder', name: 'Story Builder', minLevel: 7 }
        ];
        
        setAvailableGames(games.filter(game => {
          return game.minLevel <= (unlockedFeatures.gameLevel || 0);
        }));
      }
    };
    
    loadGames();
  }, []);
  
  const playGame = (gameId) => {
    if (gamesPlayedToday < maxGamesPerDay) {
      // Update games played count
      setGamesPlayedToday(gamesPlayedToday + 1);
      
      // Save to Supabase
      supabase
        .from('users')
        .update({ games_played_today: gamesPlayedToday + 1 })
        .eq('id', currentUserId);
      
      // Launch selected game component
      // This would involve conditionally rendering the game component
    } else {
      // Show "more tomorrow" message
      alert("You've played all your games for today. Come back tomorrow for more!");
    }
  };
  
  return (
    <div className="mini-games-container">
      <h2>Play Together</h2>
      <p>Games played today: {gamesPlayedToday}/{maxGamesPerDay}</p>
      
      <div className="games-grid">
        {availableGames.map(game => (
          <div 
            key={game.id} 
            className="game-card"
            onClick={() => playGame(game.id)}
          >
            <h3>{game.name}</h3>
            <p className="game-description">{game.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Notification & Re-engagement System

### React Implementation

```javascript
// In the service worker (public/service-worker.js)
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-96x96.png',
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// In the React application
const NotificationManager = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Register service worker
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered');
          
          // Check permission status
          return navigator.serviceWorker.ready;
        })
        .then(registration => {
          return Notification.requestPermission();
        })
        .then(permission => {
          if (permission === 'granted') {
            setPermissionGranted(true);
            
            // Subscribe to push notifications
            subscribeToPushNotifications();
          }
        })
        .catch(error => {
          console.error('Error setting up notifications:', error);
        });
    }
  }, []);
  
  const subscribeToPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
      });
      
      // Send subscription to server
      await supabase
        .from('push_subscriptions')
        .upsert([
          {
            user_id: currentUserId,
            subscription: JSON.stringify(subscription)
          }
        ]);
        
      console.log('User subscribed to notifications');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };
  
  return (
    <>
      {!permissionGranted && (
        <div className="notification-prompt">
          <p>Enable notifications to hear from your companion when you're away</p>
          <button onClick={() => Notification.requestPermission()}>
            Enable Notifications
          </button>
        </div>
      )}
    </>
  );
};
```

## Analytics Implementation

### React Implementation

```javascript
const AnalyticsManager = () => {
  useEffect(() => {
    // Track session start
    trackSessionStart();
    
    // Set up interval to track engagement
    const trackEngagementInterval = setInterval(() => {
      trackEngagement();
    }, 60000); // Every minute
    
    // Cleanup on unmount
    return () => {
      trackSessionEnd();
      clearInterval(trackEngagementInterval);
    };
  }, []);
  
  const trackSessionStart = async () => {
    const sessionData = {
      user_id: currentUserId,
      start_time: new Date().toISOString(),
      device_info: navigator.userAgent,
      screen_size: `${window.innerWidth}x${window.innerHeight}`
    };
    
    const { data, error } = await supabase
      .from('analytics_sessions')
      .insert([sessionData])
      .select();
      
    if (data && data[0]) {
      // Store session ID for later updates
      localStorage.setItem('current_session_id', data[0].id);
    }
  };
  
  const trackSessionEnd = async () => {
    const sessionId = localStorage.getItem('current_session_id');
    if (sessionId) {
      const duration = calculateSessionDuration();
      
      await supabase
        .from('analytics_sessions')
        .update({
          end_time: new Date().toISOString(),
          duration_seconds: duration
        })
        .eq('id', sessionId);
        
      localStorage.removeItem('current_session_id');
    }
  };
  
  const trackEngagement = async () => {
    // Get current needs levels
    const { data: userData } = await supabase
      .from('users')
      .select('emotional_state')
      .eq('id', currentUserId)
      .single();
      
    if (userData && userData.emotional_state) {
      const needsData = userData.emotional_state;
      
      await supabase
        .from('engagement_metrics')
        .insert([
          {
            user_id: currentUserId,
            timestamp: new Date().toISOString(),
            attention_level: needsData.attention,
            connection_level: needsData.connection,
            growth_level: needsData.growth,
            play_level: needsData.play,
            overall_care: calculateOverallCare(needsData),
            active_feature: getCurrentFeature()
          }
        ]);
    }
  };
  
  // Helper functions
  const calculateSessionDuration = () => {
    const sessionStartTime = localStorage.getItem('session_start_time');
    if (sessionStartTime) {
      const startTime = new Date(sessionStartTime).getTime();
      const currentTime = new Date().getTime();
      return Math.floor((currentTime - startTime) / 1000); // Duration in seconds
    }
    return 0;
  };
  
  const calculateOverallCare = (needsData) => {
    const values = Object.values(needsData);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };
  
  const getCurrentFeature = () => {
    // Logic to determine what feature the user is currently using
    // Based on URL path or component state
    return window.location.pathname.split('/')[1] || 'home';
  };
  
  return null; // This component doesn't render anything
};
```

## Implementation Priorities

For the React + Tailwind MVP phase, focus on these engagement elements in order:

1. **Basic needs system with visual feedback**
2. **Time-awareness and day/night indicators**
3. **Simple collectible memories system**
4. **One mini-game implementation**
5. **Streak tracking and milestone rewards**

Later phases can expand to the full set of engagement mechanics before eventual migration to Unity WebGL for the immersive 3D experience. 