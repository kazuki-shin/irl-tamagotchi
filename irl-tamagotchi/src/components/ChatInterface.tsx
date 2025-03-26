import React, { useState, useRef, useEffect } from 'react';
import { useCompanion } from '../context/CompanionContext';
import { Message } from '../types';
import useAudioRecorder from '../hooks/useAudioRecorder';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const { messages, addUserMessage, isProcessing, companionState } = useCompanion();
  const [inputText, setInputText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { recordingState, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  
  // Auto-scroll to bottom of messages on any message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Process transcription when available
  useEffect(() => {
    if (recordingState.transcription && !recordingState.isTranscribing && !isProcessing) {
      addUserMessage(recordingState.transcription);
      resetRecording();
    }
  }, [recordingState.transcription, recordingState.isTranscribing, isProcessing, addUserMessage, resetRecording]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      // Clear input immediately for better user experience
      const message = inputText.trim();
      setInputText('');
      
      // Then process the message
      await addUserMessage(message);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit on Enter (without Shift key)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isProcessing) {
        handleSendMessage(e as unknown as React.FormEvent);
      }
    }
  };
  
  const handleRecordToggle = () => {
    if (recordingState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const toggleInputMode = () => {
    setShowTextInput(!showTextInput);
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Get only the messages we want to display
  const displayMessages = messages.filter(message => message.role !== 'system');
  
  return (
    <div className={`flex flex-col bg-white rounded-lg shadow-md ${className}`}>
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[500px]">
        {displayMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {/* Show typing indicator when the companion is thinking */}
        {companionState.isThinking && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3 max-w-[70%]">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area - prioritize speech */}
      <div className="border-t p-4">
        {!showTextInput ? (
          <div className="flex flex-col items-center">
            <div className="text-center mb-3">
              {recordingState.isRecording ? (
                <p className="text-red-500 font-medium text-lg">I'm listening to you...</p>
              ) : recordingState.isTranscribing ? (
                <p className="text-blue-500 font-medium text-lg">Processing what you said...</p>
              ) : (
                <p className="text-gray-600 text-lg">Tap the mic and talk to me!</p>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleRecordToggle}
              disabled={isProcessing || recordingState.isTranscribing}
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition duration-200 ${
                recordingState.isRecording 
                  ? 'bg-red-500 text-white animate-pulse scale-110'
                  : isProcessing || recordingState.isTranscribing
                    ? 'bg-gray-300 text-gray-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
              }`}
            >
              <MicrophoneIcon className="w-10 h-10" />
            </button>
            
            <button 
              onClick={toggleInputMode}
              className="text-sm text-gray-500 hover:text-indigo-600"
            >
              I prefer to type instead
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex flex-col items-center space-y-3">
            <div className="flex w-full space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
                placeholder={isProcessing ? 'Processing...' : 'Type a message...'}
                className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className={`p-2 rounded-full ${
                  !inputText.trim() || isProcessing
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-blue-500 text-white'
                }`}
              >
                <SendIcon />
              </button>
            </div>
            
            <button 
              onClick={toggleInputMode}
              className="text-sm text-gray-500 hover:text-indigo-600"
            >
              Switch back to voice input
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// Message bubble component
interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[70%] p-3 rounded-lg ${
          isUser 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <p>{message.content}</p>
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

// Icons
const MicrophoneIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default ChatInterface; 