// For the elevenlabs-node library
interface Voice {
  voice_id: string;
  name: string;
}

const API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const hasApiKey = !!API_KEY && API_KEY !== 'your_elevenlabs_api_key';

// Simple implementation for TTS using Fetch API directly
export const textToSpeech = async (text: string, voiceId: string = 'EXAVITQu4vr4xnSDxMaL'): Promise<ArrayBuffer | null> => {
  if (!hasApiKey) {
    console.warn('ElevenLabs API key not configured. Text-to-speech functionality is disabled.');
    return null;
  }
  
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
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
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
};

// Play audio from ArrayBuffer
export const playAudio = async (audioBuffer: ArrayBuffer | null): Promise<void> => {
  if (!audioBuffer) {
    return;
  }
  
  const audioContext = new AudioContext();
  const audioSource = audioContext.createBufferSource();
  
  try {
    const decodedData = await audioContext.decodeAudioData(audioBuffer);
    audioSource.buffer = decodedData;
    audioSource.connect(audioContext.destination);
    audioSource.start(0);
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

// Helper function to convert text to speech and play it
export const speakText = async (text: string, voiceId?: string): Promise<void> => {
  try {
    const audioBuffer = await textToSpeech(text, voiceId);
    await playAudio(audioBuffer);
  } catch (error) {
    console.error('Error in speakText:', error);
  }
}; 