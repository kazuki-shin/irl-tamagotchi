import OpenAI from 'openai';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const hasApiKey = !!API_KEY && API_KEY !== 'your_openai_api_key';

// Create OpenAI client only if API key is available
const openai = hasApiKey 
  ? new OpenAI({ apiKey: API_KEY })
  : null;

// Transcribe audio to text using Whisper
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  if (!hasApiKey) {
    console.warn('OpenAI API key not configured. Using mock transcription.');
    return "This is a mock transcription since the OpenAI API key is not configured.";
  }
  
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return '';
  }
};

// Get GPT response
export const getGPTResponse = async (
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>,
) => {
  if (!hasApiKey) {
    console.warn('OpenAI API key not configured. Using mock response.');
    return "I'm your AI companion, but my responses are currently limited because the OpenAI API key is not configured. Once configured, I'll be able to respond properly to your messages!";
  }
  
  try {
    if (!openai) throw new Error('OpenAI client not initialized');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message.content || '';
  } catch (error) {
    console.error('Error getting GPT response:', error);
    return '';
  }
};

// Generate embeddings for text
export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!hasApiKey) {
    console.warn('OpenAI API key not configured. Using mock embedding.');
    // Return a mock embedding of 1536 dimensions (same as OpenAI embeddings)
    return Array(1536).fill(0).map(() => Math.random());
  }
  
  try {
    if (!openai) throw new Error('OpenAI client not initialized');
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}; 