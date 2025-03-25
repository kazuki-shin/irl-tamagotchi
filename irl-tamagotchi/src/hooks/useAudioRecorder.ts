import { useState, useCallback, useRef } from 'react';
import { AudioRecordingState } from '../types';
import { transcribeAudio } from '../services/openai';

const useAudioRecorder = () => {
  const [recordingState, setRecordingState] = useState<AudioRecordingState>({
    isRecording: false,
    audioURL: null,
    audioBlob: null,
    transcription: '',
    isTranscribing: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(audioBlob);
        
        setRecordingState(prev => ({
          ...prev,
          audioURL,
          audioBlob,
          isRecording: false,
        }));
        
        // Automatically transcribe audio
        handleTranscription(audioBlob);
      };
      
      mediaRecorder.start();
      setRecordingState(prev => ({ ...prev, isRecording: true }));
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      // The onstop handler will update the state
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  }, [recordingState.isRecording]);
  
  const handleTranscription = async (audioBlob: Blob) => {
    try {
      setRecordingState(prev => ({ ...prev, isTranscribing: true }));
      
      const transcription = await transcribeAudio(audioBlob);
      
      setRecordingState(prev => ({
        ...prev,
        transcription,
        isTranscribing: false,
      }));
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setRecordingState(prev => ({ ...prev, isTranscribing: false }));
    }
  };
  
  const resetRecording = useCallback(() => {
    if (recordingState.audioURL) {
      URL.revokeObjectURL(recordingState.audioURL);
    }
    
    setRecordingState({
      isRecording: false,
      audioURL: null,
      audioBlob: null,
      transcription: '',
      isTranscribing: false,
    });
  }, [recordingState.audioURL]);

  return {
    recordingState,
    startRecording,
    stopRecording,
    resetRecording,
  };
};

export default useAudioRecorder; 