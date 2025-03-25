const API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const hasApiKey = !!API_KEY && API_KEY !== 'your_elevenlabs_api_key';

export const textToSpeech = async (text: string): Promise<Blob | null> => {
  if (!hasApiKey) {
    console.warn('ElevenLabs API key not configured. Text-to-speech functionality is disabled.');
    return null;
  }

  try {
    const voiceId = 'onwK4e9ZLuTAKqWW03F9'; // Adam voice ID
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY || '',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error converting text to speech:', error);
    return null;
  }
};

export const playAudio = (audioBlob: Blob) => {
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);
  
  audio.onended = () => {
    URL.revokeObjectURL(url);
  };

  audio.play().catch(error => {
    console.error('Failed to play audio:', error);
  });
}; 