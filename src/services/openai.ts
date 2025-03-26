import OpenAI from 'openai';

// Access environment variables through window.process or directly from import.meta
const apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

// Transcribe audio to text using Whisper
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY || ''}`,
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
  try {
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
  try {
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