## ⚡️ Lean MVP: GPTamagotchi  
### 🧠 Core Objective  
Build a working browser-based emotional AI companion with:
- Voice interaction  
- LLM responses  
- Memory recall  
- Persistent user data (via **Supabase**)
- Engagement mechanics for retention

Initial MVP using **React + Tailwind** for rapid development, with plans to eventually migrate to **Unity 3D with WebGL** for a more immersive visual experience and character interaction.

---

### ✅ Core Features (Lean MVP)

#### 1. **Voice-to-Text**
- Record audio input via browser mic.
- Send audio to **OpenAI Whisper** API.
- Transcribe and store text in Supabase (per session or per user).
- Show real-time transcription with option to correct if needed.

#### 2. **LLM-Powered Dialogue**
- Send user text + recent memory context to **GPT-4 / Claude / Gemini**.
- Personality prompt injects tone: warm, emotionally intelligent, subtle memory references.
- Return response as text + audio (via **ElevenLabs TTS**).
- Optional: show system prompt + memory window for debugging.

#### 3. **Memory System (via Supabase)**
- Store all user messages and AI responses in Supabase conversations table.
- Extract sentence embeddings via OpenAI Embeddings API.
- Store embeddings in Supabase memory_embeddings table with metadata.
- At runtime:
  - Embed latest user message
  - Use Supabase's vector similarity (pgvector) to fetch relevant memory chunks
  - Inject top-k memory entries into prompt

**Memory Relevance Implementation:**
- Hybrid ranking system combining:
  - Vector similarity (base relevance)
  - Emotional impact weighting (conversations with strong sentiment)
  - Recency gradient (slight boost to recent interactions)
  - Interaction importance markers (first meetings, significant events)

**Long-term Memory Management:**
- Hierarchical memory storage:
  - Recent raw conversations (last ~20 interactions)
  - AI-generated periodic summaries stored as memory objects
  - Core memory facts (user preferences, important details)
  - Emotional interaction patterns

**User-Facing Memory:**
- Optional "memories" view showing what companion remembers
- Ability to remove sensitive or incorrect memories
- Occasional memory callbacks ("Last month you mentioned...")

#### 4. **Companion Personality & Emotions**
- Track 3-5 core emotional dimensions (happiness, connection, curiosity)
- Evolve emotional state gradually based on:
  - Interaction frequency (regular check-ins build connection)
  - Conversation depth and user sentiment
  - User interaction patterns over time
- Visual state indicators reflecting emotional condition
- Personality adaptation through interaction rather than explicit settings
- Needs system with visible indicators (attention, connection, growth, play)
- Time-based activities and energy cycles throughout the day

#### 5. **React + Tailwind Frontend (Initial MVP)**
- Modern responsive web interface with:
  - 2D avatar or character representation with basic emotional states
  - Clean chat interface with message history
  - Voice recording button with visual feedback
  - Emotional state indicators and companion status display
- Interactive UI elements that respond to:
  - User interactions
  - Time of day
  - Companion's emotional state
  - Care level and interaction frequency

**Conversation Flow States:**
- Visual indicator states:
  - Listening: Animated indicator showing the companion is listening
  - Processing: "Thinking" animation or loading state
  - Speaking: Text display with optional animated elements
- Transitions between emotional states through visual cues
- Reactive UI elements based on conversation sentiment
- Aim for <2s processing time when possible

**Error Recovery:**
- Show real-time transcription for monitoring recognition
- Clarifying questions for low-confidence transcriptions
- User-friendly error states with personality
- Local storage backup for recent conversation context
- Text input fallback option when voice systems fail

#### 6. **Engagement & Retention Mechanics**

**Daily Engagement Loop:**
- Time-aware interactions based on user's local time
- Morning greetings and evening wind-down conversations
- Daily discoveries or creations to share with the user
- Push notification support for companion-initiated check-ins
- Streaks and consistent interaction tracking

**Needs System:**
- Visual indicators for companion needs:
  - Attention: Increases when user is absent
  - Connection: Built through meaningful conversation
  - Growth: Satisfied by learning new things about the user
  - Play: Requires interactive play and games
- Gentle decay rates that don't induce anxiety but encourage regular visits
- Visual UI changes that reflect care level

**Reward Mechanics:**
- Collectible memories visualized in the interface
- Unlockable companion customization options
- UI theme upgrades and evolving visual elements
- Special interactions unlocked at milestones
- Surprise gifts and creations based on conversation history

**Interactive Elements:**
- Simple interactive elements in the UI
- UI that reflects time of day and emotional state
- Virtual items that grow or evolve with consistent care
- Simple mini-games and playful interactions

---

### 🧰 Updated Tech Stack

| Component            | Tech Used                                |
|---------------------|-------------------------------------------|
| **Initial Frontend** | React + Tailwind CSS                      |
| **Future Frontend**  | Unity Engine with WebGL export, Blender for 3D assets |
| **Voice Recognition**| OpenAI Whisper                            |
| **LLM API**          | OpenAI GPT-4 / Claude / Gemini            |
| **Text-to-Speech**   | ElevenLabs                                |
| **Storage**          | Supabase (Postgres + pgvector)            |
| **Backend Server**   | FastAPI / Flask                           |

---

### 🗃 Supabase Schema (MVP)

#### Table: users
- id: UUID  
- created_at  
- name (optional)  
- personality_settings (jsonb)
- emotional_state (jsonb - tracks emotional dimensions)

#### Table: conversations
- id: UUID  
- user_id: FK  
- timestamp: datetime  
- role: 'user' | 'assistant'  
- text: string  
- tone: string (optional sentiment tag)
- importance_marker: integer (0-5 scale for memory weighting)

#### Table: memory_embeddings
- id: UUID  
- user_id: FK  
- embedding: vector(1536) (OpenAI format)  
- text: string  
- source: 'conversation' | 'summary' | 'core_memory' | 'emotion_pattern'  
- timestamp
- emotional_impact: float (-1.0 to 1.0)
- memory_type: 'episodic' | 'summary' | 'fact' | 'pattern'

#### Table: emotional_history
- id: UUID
- user_id: FK
- timestamp: datetime
- dimensions: jsonb (happiness, connection, curiosity, etc.)
- trigger_conversation_id: FK (optional)

#### Table: engagement_metrics
- id: UUID
- user_id: FK
- last_interaction: datetime
- streak_count: integer
- total_interactions: integer
- care_level: float (0.0 to 1.0)
- unlocked_features: jsonb
- collectibles: jsonb

---

### 🎯 Success Criteria

- Functional voice → LLM → voice loop
- Memory pull from past sessions improves dialogue
- Testers describe experience as: "it remembered," "feels alive," "less like a chatbot"
- Emotional state evolution noticeable over multiple sessions
- Error recovery maintains the companion illusion
- **Daily active return rate of >30% in first month**
- **Average session time >3 minutes**
- **User retention metrics showing engagement with reward systems**
- Collect emails via teaser site (waitlist)

---

### 🗓 Updated 3-Week Dev Plan

| Week | Milestone                                                 |
|------|-----------------------------------------------------------|
| 1    | React + Tailwind project setup with basic UI components   |
|      | Voice input → LLM response → TTS loop integration         |
|      | Supabase set up w/ user + convo schema                    |
| 2    | UI states for emotional responses and conversation flow   |
|      | Embedding pipeline + memory recall via pgvector           |
|      | Responsive UI implementation with chat and voice controls |
|      | Basic needs system and engagement indicators              |
| 3    | Emotional state tracking and visual representation        |
|      | Engagement mechanics and reward systems implementation    |
|      | Performance optimization and testing                      |
|      | Final polish of UI and character responsiveness           |
| →    | Optional: Launch teaser page w/ waitlist + early access   |
| →    | Begin planning migration to Unity 3D with WebGL           |