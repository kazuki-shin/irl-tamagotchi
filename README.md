# GPTamagotchi

An emotionally intelligent AI companion that evolves through interaction.

## Overview

GPTamagotchi is a browser-based AI companion that features:

- Voice interaction via OpenAI Whisper
- Natural language processing via GPT-4/Claude/Gemini
- Text-to-speech responses via ElevenLabs
- Long-term memory with Supabase/pgvector
- Emotional states that evolve based on interaction
- Engagement mechanics for user retention

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **APIs**: OpenAI (GPT & Whisper), ElevenLabs
- **Backend Storage**: Supabase (PostgreSQL + pgvector)
- **State Management**: React Context
- **Deployment**: Web-based

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account
- OpenAI API key
- ElevenLabs API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/gptamagotchi.git
   cd gptamagotchi
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   REACT_APP_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

4. Set up Supabase:
   - Create the necessary tables (see schema in PRD.md)
   - Enable pgvector extension
   - Set up vector storage for embeddings

5. Start the development server:
   ```
   npm start
   ```

## Features

### Voice Interaction
Speak directly to your companion and receive both text and voice responses.

### Memory System
Your companion remembers previous interactions and refers to them naturally in conversation.

### Emotional Evolution
The companion's emotional state evolves based on:
- Interaction frequency
- Conversation depth
- User interaction patterns

### Needs System
The companion has needs that require attention:
- Attention
- Connection
- Growth
- Play

### Collectible Memories
Significant moments become collectible memories that can be revisited.

## Future Plans

- Migration to Unity WebGL for 3D visualization
- More sophisticated emotional intelligence
- Additional mini-games and interaction types
- Mobile app version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.